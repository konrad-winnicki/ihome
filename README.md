<!-- omit in toc -->
# CHAT WITH SOCKET.IO

This module was established to learn basic principles of user authentication with OAuth 2.0 standard and real-time, bidirectional communication between web clients and servers. The project contains client app written with `React` and server app written with `Node.js` version `v18.17.1` and `TypeScript`. In the root directory it may be found GitHub CI/CD workflow configuration file, docker-compose filr, unit tests and integration tests.

<br>

<!-- omit in toc -->
## Table of Contents
- [Description](#description)
- [Instalations](#instalations)
- [Usage](#usage)
  - [Run servers:](#run-servers)
  - [Frontend interface](#frontend-interface)
- [Run all with Docker](#run-all-with-docker)
- [Backend folder structure](#backend-folder-structure)
## Description
The `CHAT` app may be used to exchange massages between registered and logged users. User can logge in with an email and a password or choose user authentication with Google. Each user can create own chat room or enter to existing ones. Data persistence is achieved by using MongoDB. 

<br>

## Instalations 
To use the library you can clone the repository and install all dependencies.

```bash
git clone https://github.com/konrad-winnicki/chat
```

```bash
npm install
```
Before run application:
 - in `./server` directory you have to prepare .env file containing the following key-value pairs:
```javascript
MONGO_URI="mongodb://localhost:27017"
NODE_ENV="development"
TEST_DATABASE='test'                                            //example
DATABASE="chat"                                                 //example
PORT="8011"                                                     //example

JWT_SECRET='passwordForJWTSecret'                               //example

SOCKET_ORIGIN="http://localhost:5173"                           //default Vite port
CLIENT_ID='your google API Client ID'
CLIENT_SECRET='your goole API client secret'
CALLBACK_URL='http://localhost:8011/api/auth/google/callback'   //example, can be set in the google API
EXCHANGE_TOKEN_URI="https://oauth2.googleapis.com/token"
REDIRECT_URL_WITH_TOKEN = 'http://localhost:5173/api/chatroom'
```

- in `./client` you have to set up the following variables:

```javascript
const PORT = "8011";
const REDIRECT_URI = "http://localhost:8011/api/auth/google/callback" //example, can be set in the google API
const CLIENT_ID = 'your google API Client ID'

```


## Usage

`Package.json` in the server directory `./server` contains several predefined scripts which can be initialized with `npm run` and:</br>
```build``` : to transpile `TypeScript` to `JavaScript` </br>
```prod``` : to start the backend server in the production </br>
```dev``` : to start server in development mode </br>
```test_domain``` : to start domain tests</br>
```test_api``` : to start integration api tests</br>

### Run servers: 
To run backend server you can type in `./server` directory:
```bash
npm run dev
```
To run frontend you can type in `./client` directory:
```bash
npm run dev
```


In the development and production mode application uses a `MongoDB` database started on the localhost. Thus, to use dev mode you need to [download](https://www.mongodb.com/try/download/community) and install `MongoDB`. All necessary configurations for transpilation and testing you will find in `tsconfig.json` and `package.json`, respectively.
You can also run mongo service defined in `docker-compose.yaml` file by typing in the project root directory:

```bash
docker compose up mongodb -d 
```

### Frontend interface

Now you can use `CHAT` interface by going to:

http://localhost:5173/login

## Run all with Docker
The `Dockerfiles` contain set of instructions and configurations to build a Docker container images for frontend and backend.
The `docker-compose.yaml` file specifies the services for backend, frontend and mongodb
To run databases, backend and frontend with docker, just type in the project root directory:

```bash
docker compose up -d
```

To stop all docker containers type:
```bash
docker compose down 
```


## Backend folder structure

```
src/
├── application
│   ├── ChatRoomInterface.ts
│   ├── ChatRoomService.ts
│   ├── servicesBuilder.ts
│   ├── UserInterface.ts
│   └── UserService.ts
│
├── domain
│   ├── ChatRoomList.ts
│   ├── ChatRoom.ts
│   ├── RoomOccupancyManager.ts
│   └── User.ts
│
├── infractructure
│   │
│   ├── controllers
│   │   ├── auxilaryFunctions.ts
│   │   └── controllers.ts
│   │
│   ├── database
│   │   ├── databaseManagers
│   │   │   ├── chatRoomDbManager.ts
│   │   │   └── userDbManager.ts
│   │   │
│   │   ├── mongoDbConnection.ts
│   │   └── mongoDbModel.ts
│   │
│   ├── errorHandler.ts
│   │
│   ├── middleware
│   │   ├── auth.ts
│   │   └── socketAuth.ts
│   │
│   ├── routes.ts
│   └── socket
│       ├── personHandler.ts
│       ├── roomHandler.ts
│       └── socketSetup.ts
│
├── appSetup.ts
├── app.ts
├── server.ts
└── types.d.ts

```








