# Phoneme Studio

Student: Eliyash Hassan  
Student ID: 22204648  
Subject: CSE3CWA  
Assessment: Assessment 2

## Overview

Phoneme Studio is a full-stack classroom activity builder for phoneme-based Wordle and Word Search activities. Teachers can manage reusable activity configurations, phoneme word lists, hints and settings, then generate classroom activities using stored database data.

## Technology

- Next.js 16
- React 19
- TypeScript
- PostgreSQL 16
- Prisma ORM
- Docker and Docker Compose

## Architecture

The application uses three main layers:

1. Next.js/React frontend for the teacher interface and activity builders.
2. Next.js server-side API routes for validation and CRUD operations.
3. PostgreSQL accessed through Prisma ORM for persistent storage.

The frontend communicates with the backend API rather than directly accessing the database.

## Database Schema

Activity stores reusable configurations including name, activity type, difficulty, maximum guesses, Word Search rows and columns, hint settings and timestamps.

Word stores the English word, optional hint, phoneme array, related activity ID and timestamps.

An Activity has many Words. The relationship supports multiple independent Wordle and Word Search configurations.

Phonemes are stored as arrays. This preserves multi-character phonemes such as tʃ, dʒ, iː and eə as complete phoneme units.

## CRUD API

GET /api/activities - read activities  
POST /api/activities - create activity  
GET /api/activities/:id - read activity  
PUT /api/activities/:id - update activity  
DELETE /api/activities/:id - delete activity

GET /api/words - read words  
POST /api/words - create word  
GET /api/words/:id - read word  
PUT /api/words/:id - update word  
DELETE /api/words/:id - delete word

GET /health - verify application and PostgreSQL connectivity

## Validation and Error Handling

The backend validates activity names, supported activity types, difficulty settings, activity IDs, English words and phoneme arrays. It also checks that referenced activities exist before storing words.

Invalid requests return appropriate error responses and missing database resources are handled by the API.

## Teacher Management

The /teacher interface allows teachers to:

- create activity configurations;
- read stored configurations;
- update settings;
- delete configurations;
- create phoneme words and hints;
- edit words;
- delete words;
- maintain multiple activity configurations.

## Database-Driven Activities

The Wordle builder loads its target words and configuration through the backend instead of depending on the original hardcoded corpus.

The Word Search builder loads its phoneme words and grid configuration from stored activity data.

Generated standalone HTML uses the selected stored activity data.

## Accessibility

Forms use labels and standard browser controls. Buttons contain visible text and status messages communicate database operations. Game controls are designed to support keyboard interaction as well as pointer interaction.

## Scalability

Separating Activity and Word data from frontend components allows additional configurations and classroom word sets to be stored without changing the frontend corpus. Separating the UI, API and persistence layers also makes future activity types easier to add.

## Local Setup

Install dependencies with:

npm install

Generate the Prisma contract with:

npm run contract:emit

Configure DATABASE_URL in a local .env file.

Start development with:

npm run dev

Verify a production build with:

npm run build

## Docker

The Docker Compose environment contains the Next.js application and PostgreSQL 16 database.

Build and start with:

docker compose up --build

Verify containers with:

docker compose ps

Health check:

http://localhost:3000/health

Stop with:

docker compose down

The database uses a Docker volume for persistent storage and a PostgreSQL health check before the application starts.

## Generative AI Acknowledgement

Generative AI tools, including ChatGPT, were used under the assessment's Full AI category to assist with planning, debugging, code suggestions, backend and database integration, Docker configuration, documentation structure and review.

AI-generated suggestions were reviewed, tested and adapted during development. The student remains responsible for understanding, demonstrating and submitting the final implementation.

## References

Docker. (2026). Docker documentation. https://docs.docker.com/

MDN Web Docs. (2026). HTTP. https://developer.mozilla.org/en-US/docs/Web/HTTP

Next.js. (2026). Next.js documentation. https://nextjs.org/docs

PostgreSQL Global Development Group. (2026). PostgreSQL documentation. https://www.postgresql.org/docs/

Prisma. (2026). Prisma documentation. https://www.prisma.io/docs/
