import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    // Всегда выполняем проверку пароля, даже если пользователь не найден
    // Это предотвращает timing attacks (утечку информации о существовании email)
    const passwordHash = user?.passwordHash || '$2a$10$dummyhashfordummyuserpreventingtimingattack';
    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async register(registerDto: RegisterDto) {
    const { email, password, role, firstName, lastName, middleName } = registerDto;

    // Хешируем пароль
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Создаем пользователя (используем email как login)
    const user = await this.usersService.create(
      email,
      passwordHash,
      role,
      firstName,
      lastName,
      middleName,
      email, // login = email
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
      },
    };
  }

  getIframeToken(user: any) {
    if (!user || !user.id || !user.email) {
      throw new UnauthorizedException('Invalid user data');
    }
    const payload = { email: user.email, sub: user.id, role: user.role };
    return this.jwtService.sign(payload);
  }
}
