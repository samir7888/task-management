import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { EmailModule } from 'src/email/email.module';
import { TeamService } from './team.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [
    EmailModule,
  ],
  controllers: [TeamController],
  providers: [TeamService, PrismaService],
})
export class TeamModule { }
