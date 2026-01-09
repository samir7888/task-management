import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/role.decorators';
import { Role } from 'src/generated/prisma/enums';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { AcceptInviteDto, CreateTeamDto, InviteDto } from './dto/team.dto';
import { TeamService } from './team.service';

@Controller('api/teams')
@UseGuards(AuthGuard, RolesGuard)



export class TeamController {
    constructor(readonly teamService: TeamService) {}

    @Post()
    @Roles(Role.ADMIN)
    createTeam(@Body() createTeamDto: CreateTeamDto, @Req() req: any) {
         return this.teamService.createTeam(createTeamDto, req.user.id);
       
    }
    @Get()
    @Roles(Role.ADMIN)
    getTeams() {
        return this.teamService.getTeams();
    }
    @Get(':id')
    @Roles(Role.ADMIN)
    getTeamById(@Param('id') id: string) {
        return this.teamService.getTeamById(id);
    }
    @Get(':id/members')
    getTeamMembers(@Param('id') id: string) {
        return this.teamService.getTeamMembers(id);
    }
    @Delete(':id')
    @Roles(Role.ADMIN)
    deleteTeam(@Param('id') id: string) {
        return this.teamService.deleteTeam(id);
    }
    @Patch(':id')
    @Roles(Role.ADMIN)
    updateTeam(@Param('id') id: string, @Body() updateTeamDto: CreateTeamDto) {
        return this.teamService.updateTeam(id, updateTeamDto);
    }

    //invites-routes
   @Post(':teamId/invites')
    @Roles(Role.ADMIN, Role.LEAD)
    inviteUserToTeam(@Param('teamId') teamId: string, @Body() inviteDto: InviteDto, @Req() req: any) {
        return this.teamService.createInvite(teamId, inviteDto, req.user.id);
    }
     

    //accept invite
    @Post('invites/accept')
    acceptInvite(@Body() acceptInviteDto: AcceptInviteDto) {
        return this.teamService.acceptInvite(acceptInviteDto.token);
    }

    //view invites
    @Get('/teams/:teamId/invites')
    @Roles(Role.ADMIN)
    getInvites(@Param('teamId') teamId: string) {
        return this.teamService.ViewInvites(teamId);
    }
}
