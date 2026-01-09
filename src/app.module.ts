import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TeamModule } from './team/team.module';
import { QueueModule } from './queue/queue.module';
import { EmailModule } from './email/email.module';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [AuthModule, UserModule, TeamModule, QueueModule, EmailModule, TodosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
