export declare enum ResourceType {
    PATIENT = "patient",
    DOCTOR = "doctor",
    USER = "user"
}
export declare const RESOURCE_TYPE_KEY = "resourceType";
export declare const RESOURCE_PARAM_KEY = "resourceParam";
export declare const Resource: (type: ResourceType, paramName?: string) => import("@nestjs/common").CustomDecorator<string>;
