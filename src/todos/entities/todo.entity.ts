import { ApiProperty } from '@nestjs/swagger';

export class Todo {
    @ApiProperty({ example: 'uuid-123' })
    id: string;

    @ApiProperty({ example: 'team-uuid' })
    teamId: string;

    @ApiProperty({ example: 'Finish the report' })
    title: string;

    @ApiProperty({ example: false })
    completed: boolean;

    @ApiProperty({ example: 'user-uuid', required: false, nullable: true })
    assignedTo?: string;

    @ApiProperty({ example: 'user-uuid' })
    createdBy: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class CreateTodoResponse {
    @ApiProperty({ example: 'Todo created successfully' })
    message: string;

    @ApiProperty({ type: Todo })
    todo: Todo;
}
