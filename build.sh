#!/bin/bash

pushd ./util/barrier
docker build -t goldbuick/util-barrier .
popd

pushd ./util/proxy
docker build -t goldbuick/util-proxy .
popd

pushd ./util/static
docker build -t goldbuick/util-static .
popd

pushd ./stem
docker build -f api-ident.Dockerfile -t goldbuick/stem-api-ident .
docker build -f api-irc.Dockerfile -t goldbuick/stem-api-irc .
docker build -f base.Dockerfile -t goldbuick/stem-base .
docker build -f pass-log.Dockerfile -t goldbuick/stem-pass-log .
popd

pushd ./ui/chat
make clean build
docker build -t goldbuick/ui-chat .
popd

pushd ./ui/config
make clean build
docker build -t goldbuick/ui-config .
popd

pushd ./ui/uplink
make clean build
docker build -t goldbuick/ui-uplink .
popd

docker rmi -f $(docker images | grep "<none>" | awk "{print \$3}")
docker images