import { PrismaService } from '../prisma/prisma.service';
export declare class TariffsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        options: {
            id: string;
            createdAt: Date;
            tariffId: string;
            description: string | null;
            title: string;
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
