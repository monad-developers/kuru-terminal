#!/bin/bash 
# I think I left this bash script here, please remove if not needed :)

docker run --name postgres --network host -e POSTGRESS_USER=postgres -e POSTGRES_PASSWORD=password -d postgres
sleep 2
docker exec -it postgres psql -U postgres -c "CREATE DATABASE \"kuru-terminal\";"