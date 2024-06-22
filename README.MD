# Pip

A social chatting app where you can add your friends and loved ones and chat with them

## Demo

Coming Soon

## Tools used

-   ExpressJS and NodeJS
-   Angular
-   tailwind
-   Socket.io
-   RabbitMQ
-   MongoDB
-   Nginx

## Features

-   Creating your own account
-   Changing your username and profile picture that your friends see
-   Ability to search for other users and send them friend requests
-   Manuiplation of friend requests such as accepting or rejecting
-   Ability to send and receive realtime messages from other users

## Installation by docker

-   clone project

```bash
git clone https://github.com/osamagharib44/pip
```

-   create mongoDB volume

```bash
docker volume create mongo
```

-   Build and run

```bash
docker compose build && docker compose up
```

Go to localhost:80 to test

## Installation locally

Make sure you have rabbitMQ and mongoDB already installed and running on their respective default ports

-   install node

```bash
# installs nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# download and install Node.js (you may need to restart the terminal)
nvm install 20

# verifies the right Node.js version is in the environment
node -v # should print `v20.15.0`

# verifies the right NPM version is in the environment
npm -v # should print `10.7.0`
```

-   install angluar cli

```bash
npm install @angluar/cli
```

-   clone project

```bash
git clone https://github.com/osamagharib44/pip
```

-   setup the frontend

```bash
cd frontend
npm install
ng serve
```

-   setup the backend

```bash
cd backend
npm install
npm start
```

go to localhost:4200 to test
