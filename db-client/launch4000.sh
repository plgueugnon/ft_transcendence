docker build -t db-client .
docker run -it -p 4000:80 -e PGADMIN_DEFAULT_EMAIL=cl@cl.com -e PGADMIN_DEFAULT_PASSWORD=1234 db-client