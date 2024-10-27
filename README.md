# Concurrent Transactions

A simple account transfer Application to showcase concurrent transactions in a high-availability system

## Summary

- [Project setup](#project-setup)
  1. [Setting up Environment Variables](#1-setting-up-environment-variables)
  2. [Installing dependencies](#2-installing-dependencies)
  3. [Setting up the database](#3-setting-up-the-database)
  4. [Running the project](#4-running-the-project)
- [Using the project](#using-the-project)
- [Running tests](#running-tests)

## Project setup

### 1. Setting up Environment Variables

Before running this project for the first time, you'll need a **PostgreSQL** instance with an empty database up and running

To configure the project to use this instance, you can create a copy of the [**.env.example**](/.env.example) file and name it **.env**

Inside that file, there's a single environment variable called DATABASE_URL. Replace its value with the credentials of your own database:

```shell
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/testdatabase"
```

Don't worry, _this **.env** file will not be included when commiting changes with git_

### 2. Installing dependencies

Run one of the following commands on the shell at the root folder of this project:

```bash
# Installing all dependencies
$ npm install
# or
$ npm i

# Production installation
# (smaller, does not affect package-lock.json)
$ npm ci
```

### 3. Setting up the database

There are a few predefined scripts to help configure your database, run or resetting migrations as well as generating a new migration and schema while in development

```bash
# Runs all migrations
$ npm run migration:run

# Drops entire database and reapplies all migrations
$ npm run migration:reset:dev

# Creates a new migration. Replace <migration_name> with the preferred name
$ npm run migration:create <migration_name>
```

### 4. Running the project

After setting everything up, simply run `npm run start` to boot up the project in development mode. Or use one of the boot options:

```bash
# development mode
$ npm run start

# development with watch mode (updates when code changes are saved)
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Using the project

The available routes and functions are as follows:

| Method | Route              | Description                                      |
| ------ | ------------------ | ------------------------------------------------ |
| POST   | `/contas`          | Create new Account                               |
| GET    | `/contas`          | List Accounts                                    |
| GET    | `/contas/{numero}` | Find Account                                     |
| DELETE | `/contas/{numero}` | Delete Account (mostly for development purposes) |
| POST   | `/transacoes`      | Make a Transaction                               |
| GET    | `/transacoes`      | List Transactions                                |
| GET    | `/transacoes/{id}` | Find Transaction                                 |

## Running tests

```bash
# unit tests
$ npm run test

# end-to-end tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
