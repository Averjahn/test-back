import { TrainersService } from './trainers.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
export declare class TrainersController {
    private trainersService;
    constructor(trainersService: TrainersService);
    findAll(section?: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string | null;
        iframeUrl: string;
        section: string;
    }[]>;
    getSections(): Promise<string[]>;
    findBySection(section: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string | null;
        iframeUrl: string;
        section: string;
    }[]>;
    findById(id: string): Promise<{
        assignments: ({
            patient: {
                user: {
                    id: string;
                    email: string;
                    firstName: string | null;
                    lastName: string | null;
                    middleName: string | null;
                    login: string;
                };
            } & {
                id: string;
                createdAt: Date;
                birthDate: Date | null;
                avatarUrl: string | null;
                trustedContact: string | null;
                tariffId: string | null;
                userId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            patientId: string;
            doctorId: string;
            trainerId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string | null;
        iframeUrl: string;
        section: string;
    }>;
    create(dto: CreateTrainerDto): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string | null;
        iframeUrl: string;
        section: string;
    }>;
    update(id: string, dto: UpdateTrainerDto): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string | null;
        iframeUrl: string;
        section: string;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        description: string | null;
        iframeUrl: string;
        section: string;
    }>;
}
