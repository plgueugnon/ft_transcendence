FROM	node:17-alpine3.14

WORKDIR /app

COPY	./package.json ./
COPY	./package-lock.json ./
COPY	./tsconfig* ./

RUN		npm install --force > server.log 2>&1

COPY	./src ./src
COPY	./public ./public

RUN		npm run build

EXPOSE	3000

CMD		npx serve -s build -l 3000
