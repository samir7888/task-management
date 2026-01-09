import { IsEnum, IsString, MinLength } from "class-validator";
import { Role } from "src/generated/prisma/enums";

export class CreateTeamDto {

    @IsString()
    @MinLength(3)
    name: string;
}


export class InviteDto {

    @IsString()
    @MinLength(3)
    email: string;

    @IsEnum(Role)
    role: Role;
}

export class AcceptInviteDto {
    @IsString()
    token: string;
}
