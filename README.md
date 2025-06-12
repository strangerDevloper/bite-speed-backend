# Bite Speed Backend

A Node.js backend project using TypeScript, Express, and TypeORM with robust error handling and graceful shutdown.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=8080
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=bite_speed_db
```

4. **Run TypeORM migrations to set up the database schema:**
```bash
npm run typeorm migration:run -- -d ./src/config/db.ts
```
> This will create all necessary tables in your database as per the latest migrations.

5. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev`: Starts the development server with hot-reload using ts-node-dev
- `npm run build`: Builds the TypeScript code to JavaScript
- `npm start`: Runs the built code in production
- `npm run typeorm migration:run`: Runs all pending TypeORM migrations

## Project Structure

```
src/
  ├── app/            # Express application setup
  ├── config/         # Configuration files
  │   └── db.ts      # Database configuration
  ├── entities/       # TypeORM entities
  ├── types/         # TypeScript type definitions
  └── index.ts       # Application entry point
```

## Features

- TypeScript support with enhanced configuration
- Express.js for API endpoints
- TypeORM for database operations
- PostgreSQL database
- Environment variable configuration
- Hot-reload in development with ts-node-dev
- Graceful shutdown handling
- Socket timeout management
- Robust error handling
- Type-safe development environment

## Development

The project uses `ts-node-dev` for development which provides:
- Fast compilation
- Automatic restart on file changes
- TypeScript support without compilation
- Better error reporting

## Production

For production deployment:
1. Build the project: `npm run build`
2. Set environment variables
3. Start the server: `npm start`

The server includes:
- Graceful shutdown handling
- Database connection management
- Socket cleanup
- Request timeout handling (55s timeout)