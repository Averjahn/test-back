"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not defined in environment variables');
    process.exit(1);
}
const pool = new pg_1.Pool({ connectionString: databaseUrl });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Seeding test data...');
    await prisma.testAnswer.deleteMany();
    await prisma.testSession.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.medicalData.deleteMany();
    await prisma.diaryEntry.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.appointmentSchedule.deleteMany();
    await prisma.patientDoctor.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.user.deleteMany();
    await prisma.trainer.deleteMany();
    await prisma.tariffOption.deleteMany();
    await prisma.tariff.deleteMany();
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await prisma.user.create({
        data: {
            login: 'admin@example.com',
            email: 'admin@example.com',
            passwordHash,
            role: client_1.UserRole.ADMIN,
            firstName: 'Админ',
            lastName: 'Системный',
        },
    });
    const doctor = await prisma.user.create({
        data: {
            login: 'doctor@example.com',
            email: 'doctor@example.com',
            passwordHash,
            role: client_1.UserRole.DOCTOR,
            firstName: 'Игорь',
            lastName: 'Докторов',
            middleName: 'Сергеевич',
            doctor: {
                create: {},
            },
        },
        include: {
            doctor: true,
        },
    });
    const patient1 = await prisma.user.create({
        data: {
            login: 'patient1@example.com',
            email: 'patient1@example.com',
            passwordHash,
            role: client_1.UserRole.PATIENT,
            firstName: 'Иван',
            lastName: 'Иванов',
            middleName: 'Иванович',
            patient: {
                create: {
                    birthDate: new Date('1990-01-15'),
                },
            },
        },
        include: {
            patient: true,
        },
    });
    const patient2 = await prisma.user.create({
        data: {
            login: 'patient2@example.com',
            email: 'patient2@example.com',
            passwordHash,
            role: client_1.UserRole.PATIENT,
            firstName: 'Пётр',
            lastName: 'Петров',
            middleName: 'Петрович',
            patient: {
                create: {
                    birthDate: new Date('1985-05-20'),
                },
            },
        },
        include: {
            patient: true,
        },
    });
    if (doctor.doctor) {
        const allDays = [0, 1, 2, 3, 4, 5, 6];
        const doctorId = doctor.doctor.id;
        await prisma.appointmentSchedule.createMany({
            data: allDays.map(dayOfWeek => ({
                doctorId,
                dayOfWeek,
                startTime: '08:00',
                endTime: '17:00',
                slotDuration: 30,
                isActive: true,
            })),
        });
        console.log('✅ Created default appointment schedule for doctor (all days, 08:00-17:00, 30 min slots)');
    }
    if (doctor.doctor && patient1.patient && patient2.patient) {
        await prisma.patientDoctor.createMany({
            data: [
                {
                    doctorId: doctor.doctor.id,
                    patientId: patient1.patient.id,
                },
                {
                    doctorId: doctor.doctor.id,
                    patientId: patient2.patient.id,
                },
            ],
            skipDuplicates: true,
        });
    }
    const tariffBasic = await prisma.tariff.create({
        data: {
            title: 'Базовый',
            price: 1000,
            discount: 0,
            options: {
                create: [
                    {
                        title: 'Доступ к базовым тренажёрам',
                        description: 'Ограниченный набор упражнений',
                    },
                    {
                        title: 'Консультации врача',
                        description: '1 консультация в месяц',
                    },
                    {
                        title: 'Отчеты о прогрессе',
                        description: 'Еженедельные отчеты',
                    },
                ],
            },
        },
    });
    const tariffStandard = await prisma.tariff.create({
        data: {
            title: 'Стандартный',
            price: 2500,
            discount: 10,
            options: {
                create: [
                    {
                        title: 'Доступ ко всем тренажёрам',
                        description: 'Полный каталог упражнений',
                    },
                    {
                        title: 'Консультации врача',
                        description: '2 консультации в месяц',
                    },
                    {
                        title: 'Отчеты о прогрессе',
                        description: 'Ежедневные отчеты',
                    },
                    {
                        title: 'Персональный план занятий',
                        description: 'Индивидуальная программа',
                    },
                ],
            },
        },
    });
    const tariffPremium = await prisma.tariff.create({
        data: {
            title: 'Премиум',
            price: 5000,
            discount: 15,
            options: {
                create: [
                    {
                        title: 'Доступ ко всем тренажёрам',
                        description: 'Полный каталог + новые упражнения',
                    },
                    {
                        title: 'Неограниченные консультации',
                        description: 'Консультации врача в любое время',
                    },
                    {
                        title: 'Детальные отчеты',
                        description: 'Ежедневные отчеты с аналитикой',
                    },
                    {
                        title: 'Персональный план занятий',
                        description: 'Индивидуальная программа + корректировки',
                    },
                    {
                        title: 'Приоритетная поддержка',
                        description: 'Быстрое решение вопросов',
                    },
                ],
            },
        },
    });
    console.log(`✅ Created tariffs: ${tariffBasic.title}, ${tariffStandard.title}, ${tariffPremium.title}`);
    const trainer = await prisma.trainer.create({
        data: {
            title: 'Тест на произношение звуков',
            description: 'Интерактивный тренажёр для развития произношения звуков Р, Л, С. Тест помогает оценить и улучшить речевые навыки.',
            iframeUrl: 'https://v0-test-web-application.vercel.app',
            section: '1.1',
        },
    });
    const trainer2 = await prisma.trainer.create({
        data: {
            title: 'Тренировка артикуляции',
            description: 'Упражнения для улучшения артикуляции и четкости речи. Работа над произношением сложных звукосочетаний.',
            iframeUrl: 'https://v0-test-web-application.vercel.app',
            section: '1.2',
        },
    });
    const trainer3 = await prisma.trainer.create({
        data: {
            title: 'Тест на понимание речи',
            description: 'Проверка понимания устной речи и способности различать звуки в словах.',
            iframeUrl: 'https://v0-test-web-application.vercel.app',
            section: '2.1',
        },
    });
    console.log(`✅ Created trainer: ${trainer.title} (${trainer.id})`);
    console.log(`✅ Created trainer: ${trainer2.title} (${trainer2.id})`);
    console.log(`✅ Created trainer: ${trainer3.title} (${trainer3.id})`);
    const now = new Date();
    if (doctor.doctor && patient1.patient) {
        const assignment = await prisma.assignment.create({
            data: {
                patientId: patient1.patient.id,
                doctorId: doctor.doctor.id,
                trainerId: trainer.id,
            },
        });
        console.log(`✅ Assigned trainer to patient1: assignment ${assignment.id}`);
        const session1Started = new Date(now);
        session1Started.setHours(9, 30, 0, 0);
        session1Started.setDate(now.getDate());
        const session1Finished = new Date(session1Started);
        session1Finished.setMinutes(session1Finished.getMinutes() + 12);
        const session1Duration = Math.floor((session1Finished.getTime() - session1Started.getTime()) / 1000);
        const session1 = await prisma.testSession.create({
            data: {
                assignmentId: assignment.id,
                startedAt: session1Started,
                finishedAt: session1Finished,
                correct: 10,
                incorrect: 0,
                durationSec: session1Duration,
            },
        });
        await Promise.all(Array.from({ length: 10 }, (_, i) => prisma.testAnswer.create({
            data: {
                sessionId: session1.id,
                questionId: `question-${i + 1}`,
                answer: { selected: `option-${i + 1}`, value: `Ответ ${i + 1}` },
                isCorrect: true,
                createdAt: new Date(session1Started.getTime() + (i + 1) * 72000),
            },
        })));
        console.log(`✅ Created test session 1: ${session1.correct} correct, ${session1.incorrect} incorrect, ${Math.floor(session1Duration / 60)} min`);
        const session2Started = new Date(now);
        session2Started.setDate(now.getDate() - 1);
        session2Started.setHours(18, 15, 0, 0);
        const session2Finished = new Date(session2Started);
        session2Finished.setMinutes(session2Finished.getMinutes() + 15);
        const session2Duration = Math.floor((session2Finished.getTime() - session2Started.getTime()) / 1000);
        const session2 = await prisma.testSession.create({
            data: {
                assignmentId: assignment.id,
                startedAt: session2Started,
                finishedAt: session2Finished,
                correct: 8,
                incorrect: 2,
                durationSec: session2Duration,
            },
        });
        const session2Answers = [
            true, true, true, false, true, true, true, false, true, true
        ];
        await Promise.all(session2Answers.map((isCorrect, i) => prisma.testAnswer.create({
            data: {
                sessionId: session2.id,
                questionId: `question-${i + 1}`,
                answer: { selected: `option-${i + 1}`, value: `Ответ ${i + 1}` },
                isCorrect,
                createdAt: new Date(session2Started.getTime() + (i + 1) * 90000),
            },
        })));
        console.log(`✅ Created test session 2: ${session2.correct} correct, ${session2.incorrect} incorrect, ${Math.floor(session2Duration / 60)} min`);
        const session3Started = new Date(now);
        session3Started.setDate(now.getDate() - 3);
        session3Started.setHours(14, 0, 0, 0);
        const session3Finished = new Date(session3Started);
        session3Finished.setMinutes(session3Finished.getMinutes() + 20);
        const session3Duration = Math.floor((session3Finished.getTime() - session3Started.getTime()) / 1000);
        const session3 = await prisma.testSession.create({
            data: {
                assignmentId: assignment.id,
                startedAt: session3Started,
                finishedAt: session3Finished,
                correct: 5,
                incorrect: 5,
                durationSec: session3Duration,
            },
        });
        const session3Answers = [
            true, false, true, false, true, false, true, false, true, false
        ];
        await Promise.all(session3Answers.map((isCorrect, i) => prisma.testAnswer.create({
            data: {
                sessionId: session3.id,
                questionId: `question-${i + 1}`,
                answer: { selected: `option-${i + 1}`, value: `Ответ ${i + 1}` },
                isCorrect,
                createdAt: new Date(session3Started.getTime() + (i + 1) * 120000),
            },
        })));
        console.log(`✅ Created test session 3: ${session3.correct} correct, ${session3.incorrect} incorrect, ${Math.floor(session3Duration / 60)} min`);
        const session4Started = new Date(now);
        session4Started.setDate(now.getDate() - 5);
        session4Started.setHours(10, 45, 0, 0);
        const session4Finished = new Date(session4Started);
        session4Finished.setMinutes(session4Finished.getMinutes() + 25);
        const session4Duration = Math.floor((session4Finished.getTime() - session4Started.getTime()) / 1000);
        const session4 = await prisma.testSession.create({
            data: {
                assignmentId: assignment.id,
                startedAt: session4Started,
                finishedAt: session4Finished,
                correct: 3,
                incorrect: 7,
                durationSec: session4Duration,
            },
        });
        const session4Answers = [
            false, false, true, false, false, true, false, false, true, false
        ];
        await Promise.all(session4Answers.map((isCorrect, i) => prisma.testAnswer.create({
            data: {
                sessionId: session4.id,
                questionId: `question-${i + 1}`,
                answer: { selected: `option-${i + 1}`, value: `Ответ ${i + 1}` },
                isCorrect,
                createdAt: new Date(session4Started.getTime() + (i + 1) * 150000),
            },
        })));
        console.log(`✅ Created test session 4: ${session4.correct} correct, ${session4.incorrect} incorrect, ${Math.floor(session4Duration / 60)} min`);
        const session5Started = new Date(now);
        session5Started.setDate(now.getDate() - 7);
        session5Started.setHours(16, 30, 0, 0);
        const session5Finished = new Date(session5Started);
        session5Finished.setMinutes(session5Finished.getMinutes() + 18);
        const session5Duration = Math.floor((session5Finished.getTime() - session5Started.getTime()) / 1000);
        const session5 = await prisma.testSession.create({
            data: {
                assignmentId: assignment.id,
                startedAt: session5Started,
                finishedAt: session5Finished,
                correct: 9,
                incorrect: 1,
                durationSec: session5Duration,
            },
        });
        const session5Answers = [
            true, true, true, true, true, true, true, true, false, true
        ];
        await Promise.all(session5Answers.map((isCorrect, i) => prisma.testAnswer.create({
            data: {
                sessionId: session5.id,
                questionId: `question-${i + 1}`,
                answer: { selected: `option-${i + 1}`, value: `Ответ ${i + 1}` },
                isCorrect,
                createdAt: new Date(session5Started.getTime() + (i + 1) * 108000),
            },
        })));
        console.log(`✅ Created test session 5: ${session5.correct} correct, ${session5.incorrect} incorrect, ${Math.floor(session5Duration / 60)} min`);
        const session6Started = new Date(now);
        session6Started.setDate(now.getDate() - 10);
        session6Started.setHours(11, 0, 0, 0);
        const session6Finished = new Date(session6Started);
        session6Finished.setMinutes(session6Finished.getMinutes() + 22);
        const session6Duration = Math.floor((session6Finished.getTime() - session6Started.getTime()) / 1000);
        const session6 = await prisma.testSession.create({
            data: {
                assignmentId: assignment.id,
                startedAt: session6Started,
                finishedAt: session6Finished,
                correct: 6,
                incorrect: 4,
                durationSec: session6Duration,
            },
        });
        const session6Answers = [
            true, true, false, true, false, true, false, true, true, false
        ];
        await Promise.all(session6Answers.map((isCorrect, i) => prisma.testAnswer.create({
            data: {
                sessionId: session6.id,
                questionId: `question-${i + 1}`,
                answer: { selected: `option-${i + 1}`, value: `Ответ ${i + 1}` },
                isCorrect,
                createdAt: new Date(session6Started.getTime() + (i + 1) * 132000),
            },
        })));
        console.log(`✅ Created test session 6: ${session6.correct} correct, ${session6.incorrect} incorrect, ${Math.floor(session6Duration / 60)} min`);
        const diaryEntry = await prisma.diaryEntry.create({
            data: {
                patientId: patient1.patient.id,
                date: new Date('2025-01-11'),
                weather: 'Ясно',
                mood: 'Бодрое',
                wellbeing: 'Нормальное',
                content: 'Сегодня был особенно продуктивный день. Утро началось с гимнастики для языка и губ – эти упражнения помогают улучшить артикуляцию. Затем работал над скоростью речи, стараясь говорить плавно и без пауз. В обеденный перерыв встретил старого друга, который пришел навестить меня. Мы поговорили о том, как я восстанавливаюсь, и он поддержал меня. Вечером занимался самостоятельными упражнениями, включая чтение и письмо. Чувствую, что делаю успехи каждый день.',
            },
        });
        console.log(`✅ Created diary entry for patient1: ${diaryEntry.id}`);
    }
    if (doctor.doctor && patient2.patient) {
        const assignment2 = await prisma.assignment.create({
            data: {
                patientId: patient2.patient.id,
                doctorId: doctor.doctor.id,
                trainerId: trainer2.id,
            },
        });
        const session2Patient2Started = new Date(now);
        session2Patient2Started.setDate(now.getDate() - 2);
        session2Patient2Started.setHours(15, 20, 0, 0);
        const session2Patient2Finished = new Date(session2Patient2Started);
        session2Patient2Finished.setMinutes(session2Patient2Finished.getMinutes() + 16);
        const session2Patient2Duration = Math.floor((session2Patient2Finished.getTime() - session2Patient2Started.getTime()) / 1000);
        const session2Patient2 = await prisma.testSession.create({
            data: {
                assignmentId: assignment2.id,
                startedAt: session2Patient2Started,
                finishedAt: session2Patient2Finished,
                correct: 7,
                incorrect: 3,
                durationSec: session2Patient2Duration,
            },
        });
        const session2Patient2Answers = [
            true, true, false, true, true, false, true, true, false, true
        ];
        await Promise.all(session2Patient2Answers.map((isCorrect, i) => prisma.testAnswer.create({
            data: {
                sessionId: session2Patient2.id,
                questionId: `question-${i + 1}`,
                answer: { selected: `option-${i + 1}`, value: `Ответ ${i + 1}` },
                isCorrect,
                createdAt: new Date(session2Patient2Started.getTime() + (i + 1) * 96000),
            },
        })));
        console.log(`✅ Created test session for patient2: ${session2Patient2.correct} correct, ${session2Patient2.incorrect} incorrect, ${Math.floor(session2Patient2Duration / 60)} min`);
    }
    const allDoctors = await prisma.doctor.findMany({
        include: {
            appointmentSchedules: true,
        },
    });
    let initializedCount = 0;
    for (const doctor of allDoctors) {
        if (doctor.appointmentSchedules.length === 0) {
            const allDays = [0, 1, 2, 3, 4, 5, 6];
            await prisma.appointmentSchedule.createMany({
                data: allDays.map(dayOfWeek => ({
                    doctorId: doctor.id,
                    dayOfWeek,
                    startTime: '08:00',
                    endTime: '17:00',
                    slotDuration: 30,
                    isActive: true,
                })),
            });
            initializedCount++;
        }
    }
    if (initializedCount > 0) {
        console.log(`✅ Initialized default schedules for ${initializedCount} doctor(s) without schedules`);
    }
    console.log('\n✅ Seed completed.');
    console.log('\n📋 Test users:');
    console.log('- ADMIN   admin@example.com / password123');
    console.log('- DOCTOR  doctor@example.com / password123');
    console.log('- PATIENT patient1@example.com / password123');
    console.log('- PATIENT patient2@example.com / password123');
    console.log('\n🎯 Test trainers:');
    console.log(`- ${trainer.title} (Section: ${trainer.section}) - Assigned to patient1`);
    console.log(`- ${trainer2.title} (Section: ${trainer2.section}) - Assigned to patient2`);
    console.log(`- ${trainer3.title} (Section: ${trainer3.section})`);
    console.log('\n📊 Test sessions created:');
    console.log('- Patient1: 6 sessions with various results (excellent to poor)');
    console.log('- Patient2: 1 session with good results');
    console.log('- All sessions include answers with correct/incorrect flags');
    console.log('- Sessions have different dates, times, and durations');
    console.log('\n💳 Test tariffs:');
    console.log(`- ${tariffBasic.title}: ${tariffBasic.price} руб/мес`);
    console.log(`- ${tariffStandard.title}: ${tariffStandard.price} руб/мес (скидка ${tariffStandard.discount}%)`);
    console.log(`- ${tariffPremium.title}: ${tariffPremium.price} руб/мес (скидка ${tariffPremium.discount}%)`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=seed.js.map