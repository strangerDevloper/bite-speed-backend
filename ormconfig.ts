import { config } from 'dotenv';

config();

export default {
    type: 'postgres',
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    username: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    synchronize: false,
    logging: true,
    entities: ['src/entities/*.ts'],
    migrations: ['src/migrations/*.ts'],
    cli: {
        entitiesDir: 'src/entities',
        migrationsDir: 'src/migrations',
    },
};
