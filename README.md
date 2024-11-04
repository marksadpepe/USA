# User Service for Authentication

## Information
**[Test Assignment]**

This small service represents a user registration system. The following technologies are used:
* NestJS for the backend
* PostgreSQL as the main database
* Drizzle ORM
* Redis for storing user's information
* JWT tokens for authorization
* Docker

## Important
Before running the application, you need to create an ```.env``` file with all the environment variables. You can see an example in ```env.example``` file.

## Running
There are 2 ways to run the application:
1. By downloading the packages and running the application directly.
```bash
npm i
npm run db:generate
npm run db:push
npm run start:dev
```
2. Using Docker and docker-compose.

To run the application in Docker, make the following changes **only if you intend to run it in a Docker environment**:
* in the ```.env``` file , change the ```host``` part (after the ```@``` symbol) in the ```DB_URL``` from ```localhost``` to ```db```. This setting is required specifically for Docker networking to allow the application to connect correctly to the database service;
* if you adjust the database credentials (```DB_URL```) in the ```.env``` file, ensure you update these credentials in the ```docker-compose.yml``` file as well. This keeps configurations consistent when deploying with Docker.
```bash
docker-compose up --build
```

To connect to the PostgreSQL container, use this command:
```bash
docker exec -it <container_name> psql -U <db_username> -d <db_name>
```

To connect to the Redis container, use this command:
```bash
docker exec -it <container_name> redis-cli
```

To run tests use this command:
```bash
npm run test
npm run test:cov
```

## Swagger
The Swagger is at ```http://localhost:<servier_port>/api/v1/swagger```.
