# How to run this with docker database ?

## Install postgres

```bash
docker run -d \
 --name mypostgres \
 -p 5432:5432 \
 -e POSTGRES_PASSWORD=postgres \
 -e PGDATA=/var/lib/postgresql/data/pgdata \
 -v /home/kwcng/pgdate:/var/lib/postgresql/data \
 postgres
```

## Install mongo

```bash
docker run --name mymongo -v /home/kwcng/docker-volume/mongo:/data/db -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=mongo -e MONGO_INITDB_ROOT_PASSWORD=mongo mongo
```

## Remember to add database and createUser in the container

```bash
usedb node_main

db.createUser(
   {
     user: "mongo",
     pwd: "mongo",
     roles: [ "dbOwner" ]
   }
)
```

### RabbitMQ

```bash
docker run -d --name myrabbitmq -v /home/kwcng/docker-volume/rabbitmq/data:/var/lib/rabbitmq/ -v /home/kwcng/docker-volume/rabbitmq/logs:/var/log/rabbitmq/ -p 5672:5672 -p 15672:15672 rabbitmq:3-management-alpine
```
