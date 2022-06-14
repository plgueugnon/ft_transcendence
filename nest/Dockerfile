FROM	node:17-alpine3.14

RUN		npm i -g @nestjs/cli > server.log 2>&1

WORKDIR /app

COPY	./package.json ./
COPY	./package-lock.json ./
COPY	./tsconfig* ./

RUN		npm install --force > server.log 2>&1

COPY	./src ./src
COPY	./upload ./upload
COPY	./templates ./templates

EXPOSE	5000

RUN		npm run build

CMD		nest start
