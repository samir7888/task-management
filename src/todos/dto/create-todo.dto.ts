import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTodoDto {

    @IsString()
    @IsNotEmpty()
    teamId: string;
    
    @IsString()
    @IsNotEmpty()
    title: string;
    
    @IsBoolean()
    @IsNotEmpty()
    completed: boolean;
    
    @IsString()
    @IsOptional()
    assignedTo: string;
    
}
