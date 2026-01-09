import { ApiProperty } from '@nestjs/swagger';

export class Team {
    @ApiProperty({ example: 'uuid-123' })
    id: string;

    @ApiProperty({ example: 'Engineering Team' })
    name: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class TeamMember {
    @ApiProperty()
    id: string;

    @ApiProperty()
    teamId: string;

    @ApiProperty()
    userId: string;

    @ApiProperty({ example: 'ADMIN' })
    role: string;
}

export class Invite {
    @ApiProperty()
    id: string;

    @ApiProperty()
    teamId: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    role: string;

    @ApiProperty()
    token: string;

    @ApiProperty()
    accepted: boolean;

    @ApiProperty()
    expiresAt: Date;
}

export class MessageResponse {
    @ApiProperty({ example: 'Action successful' })
    message: string;
}

export class TeamResponse extends MessageResponse {
    @ApiProperty({ type: Team })
    team: Team;
}

export class TeamMembersResponse extends MessageResponse {
    @ApiProperty({ type: [TeamMember] })
    teamMembers: TeamMember[];
}

export class InvitesResponse extends MessageResponse {
    @ApiProperty({ type: [Invite] })
    invites: Invite[];
}
