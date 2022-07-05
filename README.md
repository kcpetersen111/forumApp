# This forum app is built with the MEVN (Mongo, Express, Vue, Node) stack

## To Run you need to start up the mongodb 
This is the docker command for setting up a local mongo instance:

    docker run -d --name cs-forum-2022-mongo -e MONGO_INITDB_ROOT_USERNAME=user -e MONGO_INITDB_ROOT_PASSWORD=password -e MONGO_INITDB_DATABASE=cs-forum-2022 -p 27017:27017 -v $PWD/mongo-entrypoint/:/docker-entrypoint-initdb.d/ mongo
