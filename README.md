<!-- omit in toc -->
# iHome

NOTE:
This application is under construction. Documentation may not be complete, hovewer main components can be used and tested by users.

<br>

<!-- omit in toc -->
## Table of Contents
- [Client side application](#client-side-application)
- [Server side applications to install on RaspberryPi](#server-side-applications-to-install-on-raspberrypi)
  - [Predefined main scripts](#predefined-main-scripts)
    - [Run servers:](#run-servers)
    - [Frontend interface](#frontend-interface)
  - [Run all with Docker](#run-all-with-docker)
## Description
This project contains a client-server application which manages devices connected to the Raskperry Pi.
The app allwos to manage sensors and switches controlling various house devices, such as water heater, heating, air purifiers and more.
The main concept of this app was to let user supply scripts runing devices in any preferable lenguage.
Applications allows data persistence in MongoDB or files.
<br>

## Instalations 
To use the library you can clone the repository and install all dependencies.

```bash
git clone https://github.com/konrad-winnicki/iHome
```

```bash
npm install
```
# Client side application
Client side app can be run:
1. as browser application. 
- install all dependencies:
```bash
npm install
```
- run app:
  
```bash
npm run dev
```
Now you can use `iHouse` interface by going to:
http://localhost:5173/api/login

2. as Android App:
- download APK file and install on SmartPhone

# Server side applications to install on RaspberryPi
- install all dependencies:
```bash
npm install
```
- run app:
  
```bash
npm run prod
```

During instalation proces user will be ask to choose
- port
- place of data persistence
- password to pair client and server


## Predefined main scripts

`Package.json` in the server directory `./server` contains several predefined scripts which can be initialized with `npm run` and:</br>
```build``` : to transpile `TypeScript` to `JavaScript` </br>
```prod``` : to start the backend server in the production </br>
```nodemon_database``` : to start nodemon and server in development mode using Mongo persistence</br>
```nodemon_file``` : to start nodemon and server in development mode using file persistence </br>
```dev_database``` : to start server in development mode using Mongo persistence</br>
```dev_file``` : to start server in development mode using file persistence </br>
```test_domain``` : to start domain tests</br>
```test_infrastructure``` : to start infrastructure tests</br>
```test_api_database``` or ```test_api_file``` : to start integration api tests</br>
```test_all_file``` or ```test_all_database``` : to start integration api tests</br>


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

Now you can use `iHouse` interface by going to:

http://localhost:5173/api/login

## Run all with Docker
The `Dockerfiles` contain set of instructions and configurations to build a Docker container images for frontend and backend.
The `docker-compose.yaml` file specifies the services for backend, frontend and mongodb
To run databases, backend and frontend with docker, just type in the project root directory:

```bash
docker-compose --env-file=.env.database up -d
```
or
```bash
docker-compose --env-file=.env.file up -d
```

To stop all docker containers type:
```bash
docker-compose down 
```











