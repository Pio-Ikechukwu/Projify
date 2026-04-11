# Projify backend

A project management REST api built with Koa, PostGreSQL, Sequelize

## Requirements

- Nodejs v24
- PostGreSQL
- nvm (recommended)

## Set up

### 1. Clone the repo

git clone <your-repo-url>
cd mytodobackend

### 2. Switch to the correct node version

nvm use

### 3. install dependencies

npm install

### 4. Setup environment variables

Create a `.env` file in the root of the project with the following:
DB_USERNAME=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_NAME=projify
DB_NAME_TEST=projify_test
DB_HOST=127.0.0.1
DB_PORT=5432

### 5. Create and migrate the databases

npm run db:create
npm run db:migrate

### 6. Start the server

npm start

## Running tests

npm test

## Database scripts

| Command              | Description                                         |
| -------------------- | --------------------------------------------------- |
| `npm run db:create`  | Creates both `projify` and `projify_test` databases |
| `npm run db:migrate` | Runs all migrations on both databases               |
| `npm run db:drop`    | Drops both databases                                |
| `npm run db:reset`   | Drops, recreates, and migrates both databases       |
