#!/bin/bash

pushd ./util/barrier
docker build -t $1/util-barrier .
popd

pushd ./util/proxy
docker build -t $1/util-proxy .
popd

pushd ./util/static
docker build -t $1/util-static .
popd

pushd ./stem
docker build -f api-ident.Dockerfile -t $1/stem-api-ident .
docker build -f api-irc.Dockerfile -t $1/stem-api-irc .
docker build -f base.Dockerfile -t $1/stem-base .
docker build -f pass-log.Dockerfile -t $1/stem-pass-log .
popd

pushd ./ui/chat
make clean build
docker build -t $1/ui-chat .
popd

pushd ./ui/config
make clean build
docker build -t $1/ui-config .
popd

pushd ./ui/uplink
make clean build
docker build -t $1/ui-uplink .
popd

docker rmi -f $(docker images | grep "<none>" | awk "{print \$3}")
docker images