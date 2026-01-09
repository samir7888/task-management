import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RegisterDto } from 'src/auth/dto/auth.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(registerDto: RegisterDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          passwordHash: registerDto.password,
          name: registerDto.name,
        },
      });
      return user;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email or name is already taken');
      }
      throw error; // Re-throw other errors so NestJS can handle them (e.g., return 500)
    }
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateRefreshToken(userId: string, hashedRefreshToken: string | null) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken },
    });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
