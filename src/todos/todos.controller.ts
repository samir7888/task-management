import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/generated/prisma/enums';
import { Roles } from 'src/auth/role.decorators';

@Controller('api/todo')
@UseGuards(AuthGuard, RolesGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createTodoDto: CreateTodoDto, @Req() req:any) {
    return this.todosService.create(createTodoDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.todosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todosService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.LEAD)
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(id, updateTodoDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.LEAD)
  remove(@Param('id') id: string) {
    return this.todosService.remove(id);
  }
}
