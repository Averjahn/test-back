import { TrainersService } from './trainers.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
export declare class TrainersController {
    private trainersService;
    constructor(trainersService: TrainersService);
    findAll(section?: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        iframeUrl: string;
        section: string;
    }[]>;
    getSections(): Promise<string[]>;
    findBySection(section: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
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
                userId: string;
                birthDate: Date | null;
                avatarUrl: string | null;
                trustedContact: string | null;
                tariffId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            doctorId: string;
            patientId: string;
            trainerId: string;
        })[];
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        iframeUrl: string;
        section: string;
    }>;
    create(dto: CreateTrainerDto): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        iframeUrl: string;
        section: string;
    }>;
    update(id: string, dto: UpdateTrainerDto): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        iframeUrl: string;
        section: string;
    }>;
    delete(id: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        title: string;
        updatedAt: Date;
        iframeUrl: string;
        section: string;
    }>;
}
