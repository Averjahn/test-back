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
exports.UpdateDiaryEntryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const WEATHER_OPTIONS = ['Ясно', 'Облачно', 'Дождь', 'Снег', 'Туман', 'Ветрено'];
const MOOD_OPTIONS = ['Бодрое', 'Спокойное', 'Подавленное', 'Тревожное', 'Радостное', 'Усталое'];
const WELLBEING_OPTIONS = ['Хорошее', 'Нормальное', 'Плохое', 'Отличное', 'Слабое'];
class UpdateDiaryEntryDto {
    date;
    weather;
    mood;
    wellbeing;
    content;
}
exports.UpdateDiaryEntryDto = UpdateDiaryEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-11', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateDiaryEntryDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ясно', enum: WEATHER_OPTIONS, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(WEATHER_OPTIONS),
    __metadata("design:type", String)
], UpdateDiaryEntryDto.prototype, "weather", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Бодрое', enum: MOOD_OPTIONS, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(MOOD_OPTIONS),
    __metadata("design:type", String)
], UpdateDiaryEntryDto.prototype, "mood", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Хорошее', enum: WELLBEING_OPTIONS, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(WELLBEING_OPTIONS),
    __metadata("design:type", String)
], UpdateDiaryEntryDto.prototype, "wellbeing", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Сегодня был особенно продуктивный день...', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDiaryEntryDto.prototype, "content", void 0);
//# sourceMappingURL=update-diary-entry.dto.js.map