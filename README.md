# DPNR-boilerplate
Docker | PostgreSQL | NestJS | React - Boilerplate (TypeScript)

## Server setup

Install basic nest cli:	npm i -g @nestjs/cli
Boilerplate project:	nest new project-name server (from root)

npm start from project-name to start server

Nest shortcuts: 
nest g mo article module
nest g co article module
nest g s article module

## Client setup

Setup react app : npx create-react-app client --template typescript (from project root root)

npm install react-router-dom

### Setting up Semantic UI

#### Basic install

	npm install semantic-ui-react semantic-ui-css

	add to index.html :

	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css"
		integrity="sha512-8bHTC73gkZ7rZ7vpqUQThUDhqcNFyYi2xgDgPDHc+GXVGHXq+xPjynxIopALmOPqzo9JZj0k6OqqewdGO3EsrQ=="
		crossorigin="anonymous" referrerpolicy="no-referrer"
	/>

## PostgreSQL

#### Insert
INSERT INTO public."users"("name", "login")
VALUES ('James Bond', 'jbond')

#### Get all
SELECT * FROM public."users"
or SELECT name FROM public."users"
or SELECT name, login FROM public."users"

#### Get by id
SELECT * FROM public."users"
WHERE id = 1 (or any other operator on any other column)

#### Get with LIKE
SELECT * FROM public."users"
WHERE login LIKE 'clucien'
or WHERE login LIKE 'c%' (wildcard)

#### Get with conditionning
SELECT * FROM public."users"
WHERE login LIKE 'jbond' AND/OR id = '2'
or WHERE NOT login LIKE 'jbond'

#### Order by
SELECT * FROM public."users"
ORDER BY name DESC/ASC (descending/ascending - default -)

## Nest for DBs (nest)

npm install --save @nestjs/typeorm typeorm pg

## Authentification (nest)

npm install @nestjs/passport passport passport-local
npm install @types/passport-local

npm install @nestjs/jwt passport-jwt
npm install @types/passport-jwt

npm install passport-oauth2
npm install @types/passport-oauth2

npm install @nestjs/axios
