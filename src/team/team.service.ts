import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTeamDto, InviteDto } from './dto/team.dto';
import { Role } from 'src/generated/prisma/enums';
import { randomUUID } from 'crypto';
import { EMAIL_QUEUE, SEND_INVITE_EMAIL } from 'src/email/email.queue';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class TeamService {


    constructor(readonly prisma: PrismaService,
        @InjectQueue(EMAIL_QUEUE)
        private readonly emailQueue: Queue

    ) { }


    async createTeam({ name }: CreateTeamDto, userId: string) {
        try {
            const team = await this.prisma.$transaction(async (tx) => {
                const team = await tx.team.create({
                    data: {
                        name,
                    },
                });
                await tx.teamMember.create({
                    data: {
                        teamId: team.id,
                        userId: userId,
                        role: 'ADMIN',
                    },
                });

            });
            return {
                message: 'Team created successfully',
            };
        } catch (error) {
            throw error;
        }
    }
    async getTeams() {
        try {
            const teams = await this.prisma.team.findMany();
            return teams;
        } catch (error) {
            throw error;
        }
    }
    async getTeamById(id: string) {
        try {
            const team = await this.prisma.team.findUnique({
                where: {
                    id,
                },
            });
            return {
                message: 'Team found successfully',
                team,
            };
        } catch (error) {
            throw error;
        }
    }

    async getTeamsByMemberId(userId: string) {
        try {
            const teams = await this.prisma.teamMember.findMany({
                where: {
                    userId,
                },
                select: {
                    team: true,
                }
            });
            return {
                message: 'Teams found successfully',
                teams,
            };
        } catch (error) {
            throw error;
        }
    }


    async getTeamMembers(teamId: string) {
        try {
            const teamMembers = await this.prisma.teamMember.findMany({
                where: {
                    teamId,
                },
                select: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            id: true,
                        },
                    },
                }
            });
            return {
                message: 'Team members found successfully',
                teamMembers,
            };
        } catch (error) {
            throw error;
        }
    }
    async deleteTeam(id: string) {
        try {
            const team = await this.prisma.team.delete({
                where: {
                    id,
                },
            });

            return {
                message: 'Team deleted successfully',
                team,
            };
        } catch (error) {
            throw error;
        }
    }
    async updateTeam(id: string, { name }: CreateTeamDto) {
        try {
            const team = await this.prisma.team.update({
                where: {
                    id,
                },
                data: {
                    name,
                },
            });
            return {
                message: 'Team updated successfully',
                team,
            };
        } catch (error) {
            throw error;
        }
    }





    //invite-user-to-team


    async createInvite(teamId: string, { email, role }: InviteDto, InvitorId: string) {



        //check whether invitor is a member of the team or not

        try {
            const invitor = await this.prisma.teamMember.findUnique(
                {
                    where: {
                        teamId_userId: {
                            teamId,
                            userId: InvitorId,
                        },
                    }
                }
            );
            if (!invitor) {
                throw new Error('Invitor is not a member of the team');
            }

            //check-role

            if (invitor.role === Role.MEMBER) {
                throw new ForbiddenException('Viewers are not allowed to invite users to the team');
            }
            if (invitor.role === Role.LEAD && role === Role.ADMIN) {
                throw new ForbiddenException('Leads are not allowed to invite Admin to the team');
            }


            //check user already exists

            const existingMember = await this.prisma.teamMember.findFirst(
                {
                    where: {
                        teamId,
                        user: { email },
                    },
                },
            );
            if (existingMember) {
                throw new BadRequestException('User already exists in team');
            }


            // 4️⃣ Check existing pending invite
            const existingInvite = await this.prisma.invite.findFirst({
                where: {
                    teamId,
                    email,
                    accepted: false,
                    expiresAt: { gt: new Date() },
                },
            });

            if (existingInvite) {
                throw new BadRequestException('Invite already sent to this email');
            }


            // 5️⃣ Create invite
            const token = randomUUID();

            const invite = await this.prisma.invite.create({
                data: {
                    teamId,
                    email,
                    role,
                    token,
                    expiresAt: addDays(new Date(), 7), // valid for 7 days
                },
            });

            // 6️⃣ Send email (later)



            await this.emailQueue.add(
                SEND_INVITE_EMAIL,
                {
                    email: invite.email,
                    token: invite.token,
                    teamId: teamId,
                },
                {
                    attempts: 5,
                    backoff: {
                        type: 'exponential',
                        delay: 3000,
                    },
                },
            );


            return {
                message: 'Invite sent successfully',
                inviteToken: invite.token,
            };
        } catch (error) {
            throw error;
        } 


    }


    //accept invite

    async acceptInvite(token: string, authenticatedUserId?: string) {
        console.log('Accepting invite for token', token);
        try {
            const invite = await this.prisma.invite.findUnique({
                where: {
                    token,
                },
            });
            if (!invite) {
                throw new NotFoundException('Invite not found');
            }
            if (invite.accepted) {
                throw new BadRequestException('Invite already accepted');
            }
            if (invite.expiresAt < new Date()) {
                throw new BadRequestException('Invite expired');
            }

            // 1. Determine target user
            let user;
            if (authenticatedUserId) {
                user = await this.prisma.user.findUnique({
                    where: { id: authenticatedUserId },
                });
            } else {
                user = await this.prisma.user.findUnique({
                    where: { email: invite.email },
                });
            }

            // 2. Case: User exists and has a password
            if (user && user.passwordHash && user.passwordHash !== '') {
                // Check if they are already in the team
                const existingMember = await this.prisma.teamMember.findUnique({
                    where: {
                        teamId_userId: {
                            teamId: invite.teamId,
                            userId: user.id
                        }
                    }
                });

                if (!existingMember) {
                    await this.prisma.$transaction([
                        this.prisma.teamMember.create({
                            data: {
                                teamId: invite.teamId,
                                userId: user.id,
                                role: invite.role,
                            },
                        }),
                        this.prisma.invite.update({
                            where: { id: invite.id },
                            data: { accepted: true }
                        })
                    ]);
                } else {
                    // If already a member, just mark invite as accepted
                    await this.prisma.invite.update({
                        where: { id: invite.id },
                        data: { accepted: true }
                    });
                }

                return {
                    message: 'Invite accepted successfully',
                    redirect: authenticatedUserId ? `/` : '/login',
                    teamId: invite.teamId,
                };
            }

            // 3. Case: User doesn't exist or has no password
            return {
                message: 'Please complete your registration',
                redirect: `/signup?token=${token}&email=${invite.email}`,
                email: invite.email,
                role: invite.role,
                teamId: invite.teamId
            };
        } catch (error) {
            throw error;
        }
    }

    // view invites
    async ViewInvites(teamId: string) {
        try {
            const invites = await this.prisma.invite.findMany({
                where: {
                    teamId,
                },
            });
            return {
                message: 'Invites found successfully',
                invites,
            };
        } catch (error) {
            throw error;
        }
    }
}


function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}