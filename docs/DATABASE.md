# Database Documentation

## Overview
This project uses **Neon Database** (Serverless PostgreSQL) as the primary data store and **Drizzle ORM** for schema management and migrations.

## Connection
The database connection is configured via the `DATABASE_URL` environment variable in the `.env` file.
Format: `postgresql://user:password@host:port/dbname?sslmode=require`

## Schema
The database schema is defined in `server/db/schema.cjs`.
Key tables include:
- **users**: Stores user accounts and authentication details.
- **projects**: Client projects.
- **invoices**: Billing and payment records.
- **subscriptions**: Service subscriptions.
- **tickets**: Support tickets.
- **notifications**: System and user notifications.
- **audit_logs**: Security and activity logs.

## Migrations
We use `drizzle-kit` for handling database migrations.

### Scripts
- **Generate Migrations**: `npm run db:generate` - Creates SQL migration files based on schema changes.
- **Run Migrations**: `npm run db:migrate` - Applies pending migrations to the database.
- **Push Schema**: `npm run db:push` - Directly synchronizes the database schema (use with caution, mostly for prototyping).
- **Studio**: `npm run db:studio` - Opens a visual database editor.

### Migration Workflow
1. Modify `server/db/schema.cjs`.
2. Run `npm run db:generate` to create a new migration file in `drizzle/`.
3. Review the generated SQL file.
4. Run `npm run db:migrate` to apply changes to Neon.

## Verification
To verify the database connection and schema integrity, run:
```bash
node server/verify-db.cjs
```
This script connects to the database and performs a basic query (counting users) to ensure connectivity.

## Deployment
For production deployment, ensure the `DATABASE_URL` is set in the environment variables of the hosting provider (e.g., Vercel, Railway). The `db:migrate` command should be part of the build or deployment pipeline.
