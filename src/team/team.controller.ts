import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/role.decorators';
import { Role } from 'src/generated/prisma/enums';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { AcceptInviteDto, CreateTeamDto, InviteDto } from './dto/team.dto';
import { TeamService } from './team.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvitesResponse, MessageResponse, Team, TeamMembersResponse, TeamResponse } from './entities/team.entity';
import { Public } from 'src/auth/public.decorator';

@ApiTags('Teams')
@ApiBearerAuth()
@Controller('api/teams')
@UseGuards(AuthGuard, RolesGuard)
export class TeamController {
    constructor(readonly teamService: TeamService) { }

    @Post()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Create a new team' })
    @ApiResponse({ status: 201, description: 'The team has been successfully created.', type: MessageResponse })
    createTeam(@Body() createTeamDto: CreateTeamDto, @Req() req: any) {
        return this.teamService.createTeam(createTeamDto, req.user.id);

    }
    @Get()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get all teams' })
    @ApiResponse({ status: 200, description: 'List of all teams.', type: [Team] })
    getTeams() {
        return this.teamService.getTeams();
    }
    @Get(':id')
    @ApiOperation({ summary: 'Get a team by id' })
    @ApiResponse({ status: 200, description: 'The found team.', type: TeamResponse })
    getTeamById(@Param('id') id: string) {
        return this.teamService.getTeamById(id);
    }

    //get all the teams where the userId is as the teammember

    @Get('member/:userId')
    @Roles(Role.ADMIN, Role.LEAD, Role.MEMBER)
    @ApiOperation({ summary: 'Get all teams where the user is a member' })
    @ApiResponse({ status: 200, description: 'List of all teams where the user is a member.', type: [Team] })
    getTeamsByMemberId(@Param('userId') userId: string) {
        return this.teamService.getTeamsByMemberId(userId);
    }









    @Get(':id/members')
    @ApiOperation({ summary: 'Get team members' })
    @ApiResponse({ status: 200, description: 'List of team members.', type: TeamMembersResponse })
    getTeamMembers(@Param('id') id: string) {
        return this.teamService.getTeamMembers(id);
    }
    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Delete a team' })
    @ApiResponse({ status: 200, description: 'The deleted team.', type: TeamResponse })
    deleteTeam(@Param('id') id: string) {
        return this.teamService.deleteTeam(id);
    }
    @Patch(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Update a team' })
    @ApiResponse({ status: 200, description: 'The updated team.', type: TeamResponse })
    updateTeam(@Param('id') id: string, @Body() updateTeamDto: CreateTeamDto) {
        return this.teamService.updateTeam(id, updateTeamDto);
    }

    //invites-routes
    @Post(':teamId/invites')
    @Roles(Role.ADMIN, Role.LEAD)
    @ApiOperation({ summary: 'Invite a user to a team' })
    @ApiResponse({ status: 201, description: 'The user has been successfully invited.' })
    inviteUserToTeam(@Param('teamId') teamId: string, @Body() inviteDto: InviteDto, @Req() req: any) {
        return this.teamService.createInvite(teamId, inviteDto, req.user.id);
    }


    //accept invite
    @Public()
    @Post('invites/accept')
    @ApiOperation({ summary: 'Accept a team invite' })
    @ApiResponse({ status: 200, description: 'Invite accepted.' })
    acceptInvite(@Body() acceptInviteDto: AcceptInviteDto, @Req() req: any) {
        return this.teamService.acceptInvite(acceptInviteDto.token, req.user?.id);
    }

    //view invites
    @Get('/teams/:teamId/invites')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'View all invites for a team' })
    @ApiResponse({ status: 200, description: 'List of invites.', type: InvitesResponse })
    getInvites(@Param('teamId') teamId: string) {
        return this.teamService.ViewInvites(teamId);
    }
}
