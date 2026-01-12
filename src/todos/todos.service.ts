import { Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createTodoDto: CreateTodoDto, creatorId: string) {
    const { teamId, title, completed, assignedTo } = createTodoDto;
    const todo = await this.prisma.todo.create({
      data: {
        teamId,
        title,
        completed,
        assignedTo,
        createdBy: creatorId,
      },
    });
    return {
      message: "Todo created successfully",
      todo,
    };
  }

  async findAll() {
    return await this.prisma.todo.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.todo.findUnique({
      where: {
        id,
      },
    });
  }

  //get todo by team id
  async findTodosByTeamId(teamId: string) {
    return await this.prisma.todo.findMany({
      where: {
        teamId,
      },
    });
  }

  async update(id: string, updateTodoDto: UpdateTodoDto) {
    return await this.prisma.todo.update({
      where: {
        id,
      },
      data: updateTodoDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.todo.delete({
      where: {
        id,
      },
    });
  }
}
