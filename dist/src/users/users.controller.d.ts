import { UsersService } from './users.service';
import { type User } from '@prisma/client';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        role: import("@prisma/client").$Enums.UserRole;
        firstName: string | null;
        lastName: string | null;
        middleName: string | null;
        createdAt: Date;
        login: string;
    }[]>;
    getCurrentUser(user: User): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        role: import("@prisma/client").$Enums.UserRole;
        firstName: string | null;
        lastName: string | null;
        middleName: string | null;
        createdAt: Date;
        login: string;
    }>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        role: import("@prisma/client").$Enums.UserRole;
        firstName: string | null;
        lastName: string | null;
        middleName: string | null;
        createdAt: Date;
        login: string;
    } | null>;
}
