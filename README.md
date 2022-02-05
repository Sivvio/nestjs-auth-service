# NestJS template

## Setup

The project uses yarn as a package manager

#### Using yarn
Install the dependencies with the following command
```shell
$ yarn install
```

#### Using npm
Remove the yarn.lock file situated at root lavel. Then execute
```shell
$ npm install
```

## Running the server
To run the server in dev mode run 
```shell
$ yarn start:dev 
```
or 
```shell
$ npm run start:dev 
```

## Writing integration tests
To write tests add a *.spec.ts file inside the test folder. The framework uses jest and 
supertest libraries. 

## Running tests
To watch tests (ideal for TDD) run the command
```shell
$ yarn test:watch 
```
or
```shell
$ npm run test:watch 
```

To run tests as part of a pipeline run
```shell
$ yarn test 
```
or
```shell
$ npm run test 
```

You can find a detailed explanation in this medium article
https://medium.com/@sivvio.piccolo/building-a-ready-for-production-microservice-in-nestjs-part-1-creating-a-template-bd59faf15e9b
