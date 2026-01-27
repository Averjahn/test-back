"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePatientProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdatePatientProfileDto {
    firstName;
    lastName;
    middleName;
    birthDate;
    trustedContact;
    avatarUrl;
}
exports.UpdatePatientProfileDto = UpdatePatientProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Иван',
        required: false,
        description: 'Имя пациента'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdatePatientProfileDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Иванов',
        required: false,
        description: 'Фамилия пациента'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdatePatientProfileDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Иванович',
        required: false,
        description: 'Отчество пациента'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdatePatientProfileDto.prototype, "middleName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '1990-01-15',
        required: false,
        description: 'Дата рождения в формате YYYY-MM-DD'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdatePatientProfileDto.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '+7 999 123-45-67',
        required: false,
        description: 'Доверенный контакт'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdatePatientProfileDto.prototype, "trustedContact", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '/uploads/avatars/avatar-123.jpg',
        required: false,
        description: 'URL аватара (null для удаления)'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdatePatientProfileDto.prototype, "avatarUrl", void 0);
//# sourceMappingURL=update-profile.dto.js.map