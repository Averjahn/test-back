import { SetMetadata } from '@nestjs/common';

export enum ResourceType {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  USER = 'user',
}

export const RESOURCE_TYPE_KEY = 'resourceType';
export const RESOURCE_PARAM_KEY = 'resourceParam';

/**
 * Декоратор для указания типа ресурса, к которому применяется проверка доступа
 */
export const Resource = (type: ResourceType, paramName: string = 'id') =>
  SetMetadata(RESOURCE_TYPE_KEY, { type, paramName });
