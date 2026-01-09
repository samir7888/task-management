import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) { }

  async register(registerDto: RegisterDto) {
    const hash = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      // 1. Create the user
      const newUser = await tx.user.create({
        data: {
          email: registerDto.email,
          name: registerDto.name,
          passwordHash: hash,
        },
      });

      // 2. If token is provided, handle invite
      if (registerDto.token) {
        const invite = await tx.invite.findUnique({
          where: { token: registerDto.token },
        });

        if (invite && !invite.accepted && invite.expiresAt > new Date()) {
          // Check if emails match (optional security check)
          if (invite.email !== registerDto.email) {
            throw new ForbiddenException('Invite email does not match registration email');
          }

          // Join team
          await tx.teamMember.create({
            data: {
              teamId: invite.teamId,
              userId: newUser.id,
              role: invite.role,
            },
          });

          // Accept invite
          await tx.invite.update({
            where: { id: invite.id },
            data: { accepted: true },
          });
        } else {
          throw new ForbiddenException('Invalid or expired invite token');
        }
      }

      return newUser;
    });

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role,
      user.name,
    );
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findUserByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role,
      user.name,
    );
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        id: string;
        email: string;
        role: string;
        name: string;
      }>(refreshTokenDto.refreshToken, {
        secret: process.env.JWT_SECRET,
      });
      const user = await this.userService.findUserById(payload.id);
      if (!user || !user.hashedRefreshToken) {
        throw new ForbiddenException('Access Denied');
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshTokenDto.refreshToken,
        user.hashedRefreshToken,
      );
      if (!refreshTokenMatches) {
        throw new ForbiddenException('Access Denied');
      }

      const tokens = await this.getTokens(
        user.id,
        user.email,
        user.role,
        user.name,
      );
      await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
      return tokens;
    } catch {
      throw new ForbiddenException('Access Denied');
    }
  }

  async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateRefreshToken(userId, hash);
  }

  async getTokens(userId: string, email: string, role: string, name: string) {
    const payload = {
      id: userId,
      email: email,
      role: role,
      name: name,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET, // Ideally use a different secret for refresh tokens
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
