import { TariffsService } from './tariffs.service';
export declare class TariffsController {
    private tariffsService;
    constructor(tariffsService: TariffsService);
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
