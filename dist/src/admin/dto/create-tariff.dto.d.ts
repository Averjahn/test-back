export declare class TariffOptionDto {
    title: string;
    description?: string;
}
export declare class CreateTariffDto {
    title: string;
    price: number;
    discount?: number;
    imageUrl?: string;
    options?: TariffOptionDto[];
}
