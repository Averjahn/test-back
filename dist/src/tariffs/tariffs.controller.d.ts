import { TariffsService } from './tariffs.service';
export declare class TariffsController {
    private tariffsService;
    constructor(tariffsService: TariffsService);
    findAll(): Promise<({
        options: {
            id: string;
            title: string;
            createdAt: Date;
            tariffId: string;
            description: string | null;
        }[];
    } & {
        id: string;
        title: string;
        price: number;
        discount: number;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
