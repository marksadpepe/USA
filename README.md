# User Service for Authentication

## Information
**[Test Assignment]**

This small service represents a user registration system. The following technologies are used:
* NestJS for the backend
* PostgreSQL as the main database
* Drizzle ORM
* Redis for storing user's information
* JWT tokens for authorization

## Important
Before running the application, you need to create an ```.env``` file with all the environment variables. You can see an example in ```env.example``` file.

## Running
There are 2 ways to run the application:
1. By downloading the packages and running the application directly.
```bash
npm i
npm run db:generate
npm run db:migrate
npm run start:dev
```
