<!-- omit in toc -->
# iHome

NOTE:
This is MVP version.The application is still under construction, hovewer main components can be used and tested by users. Documentation may not be complete. 

<br>

<!-- omit in toc -->
## Table of Contents
- [Server side applications to install on RaspberryPi](#server-side-applications-to-install-on-raspberrypi)
- [Client side application](#client-side-application)
  - [Predefined main scripts](#predefined-main-scripts)
  - [Run all with Docker](#run-all-with-docker)
  - [Sensor instalation](#sensor-instalation)

## Description
This project contains a client-server application which manages devices connected to the Raskperry Pi.
It is a client-server application which manages devices using Raspberry Pi, aiming to optimize home energy consumption. The main design concept is to enable users to control connected devices using a language of their choice.
Applications allows data persistence in MongoDB or files.
<br>

## Instalations 

To use the library you can clone the repository and install all dependencies.

```bash
git clone https://github.com/konrad-winnicki/iHome
```


# Server side applications to install on RaspberryPi
Instalation prerequirements
To use server-side application first at least Node.js version 18.18 should be installed

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
- place of data persistence (if database choosen in the next step connection string with password MongoDB Atlas should be provided)
- password to pair client and server


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

## Predefined main scripts

`Package.json` in the server directory `./server` contains several predefined scripts which can be initialized with `npm run` and:</br>
```build``` : to transpile `TypeScript` to `JavaScript` </br>
```prod``` : to start the backend server in the production mode </br>
```nodemon_database``` : to start nodemon and server in development mode using Mongo persistence</br>
```nodemon_file``` : to start nodemon and server in development mode using file persistence </br>
```dev_database``` : to start server in development mode using Mongo persistence</br>
```dev_file``` : to start server in development mode using file persistence </br>
```test_domain``` : to start domain tests</br>
```test_infrastructure``` : to start infrastructure tests</br>
```test_api_database``` or ```test_api_file``` : to start integration api tests</br>
```test_all_file``` or ```test_all_database``` : to start integration api tests</br>


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

## Sensor instalation
- indicate name
- parameters name (separated with comma, without spaces)
- patramete units (separated with comma, without spaces)
- command to run script (e.g. python3.9 /home/pi/senspr.py on)

Important: in case of sensors script should print JSON string e.g: 
```bash
'{"parameter1": "value", "parameter2": "value"}'
```












