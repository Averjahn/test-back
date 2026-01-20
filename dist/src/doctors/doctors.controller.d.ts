import { DoctorsService } from './doctors.service';
export declare class DoctorsController {
    private doctorsService;
    constructor(doctorsService: DoctorsService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
    }[]>;
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
    } | null>;
}
