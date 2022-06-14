docker ps -a | awk '{print $1}' | xargs docker rm

docker images -a |awk '{print $1}' | xargs docker rmi --force
