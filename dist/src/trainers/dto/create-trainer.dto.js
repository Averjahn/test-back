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
exports.CreateTrainerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateTrainerDto {
    title;
    description;
    iframeUrl;
    section;
}
exports.CreateTrainerDto = CreateTrainerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Тренажёр по произношению звуков' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreateTrainerDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Тренажёр для развития произношения звуков Р, Л, С',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrainerDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://v0-test.vercel.app?userId=xxx&assignmentId=yyy&token=zzz',
        description: 'URL v0 проекта с параметрами userId, assignmentId, token'
    }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateTrainerDto.prototype, "iframeUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '1.1',
        description: 'Подразделение/категория (например: 1.1, 1.2, 2.1)'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrainerDto.prototype, "section", void 0);
//# sourceMappingURL=create-trainer.dto.js.map