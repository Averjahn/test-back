import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto, res: Response): Promise<{
        user: {
            id: any;
            email: any;
            role: any;
            firstName: any;
            lastName: any;
            middleName: any;
        };
    }>;
    login(loginDto: LoginDto, res: Response): Promise<{
        user: {
            id: any;
            email: any;
            role: any;
            firstName: any;
            lastName: any;
            middleName: any;
        };
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    getIframeToken(user: any): Promise<{
        token: string;
        userId: any;
    }>;
}
