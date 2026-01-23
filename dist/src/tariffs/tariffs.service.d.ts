import { PrismaService } from '../prisma/prisma.service';
export declare class TariffsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        options: {
            id: string;
            createdAt: Date;
            tariffId: string;
            title: string;
            description: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        title: string;
        price: number;
        discount: number;
        imageUrl: string | null;
        updatedAt: Date;
    })[]>;
}
