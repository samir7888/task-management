import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/generated/prisma/enums';
import { Roles } from 'src/auth/role.decorators';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTodoResponse, Todo } from './entities/todo.entity';

@ApiTags('Todos')
@ApiBearerAuth()
@Controller('api/todo')
@UseGuards(AuthGuard, RolesGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) { }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiResponse({ status: 201, description: 'The todo has been successfully created.', type: CreateTodoResponse })
  create(@Body() createTodoDto: CreateTodoDto, @Req() req: any) {
    return this.todosService.create(createTodoDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all todos' })
  @ApiResponse({ status: 200, description: 'List of all todos.', type: [Todo] })
  findAll() {
    return this.todosService.findAll();
  }


  //get todo by team id
  @Get(':teamId')
  @ApiOperation({ summary: 'Get todos by team id' })
  @ApiResponse({ status: 200, description: 'List of todos by team id.', type: [Todo] })
  findTodosByTeamId(@Param('teamId') teamId: string) {
    return this.todosService.findTodosByTeamId(teamId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.LEAD)
  @ApiOperation({ summary: 'Update a todo' })
  @ApiResponse({ status: 200, description: 'The updated todo.', type: Todo })
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(id, updateTodoDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.LEAD)
  @ApiOperation({ summary: 'Delete a todo' })
  @ApiResponse({ status: 200, description: 'The deleted todo.', type: Todo })
  remove(@Param('id') id: string) {
    return this.todosService.remove(id);
  }
}
