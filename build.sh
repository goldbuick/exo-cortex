#!/bin/bash

pushd ./util/barrier
docker build -t goldbuick/util-barrier .
popd

pushd ./util/static
docker build -t goldbuick/util-static .
popd

pushd ./stem
docker build -f api-ident.Dockerfile -t goldbuick/stem-api-ident .
docker build -f api-irc.Dockerfile -t goldbuick/stem-api-irc .
docker build -f config-server.Dockerfile -t goldbuick/stem-config-server .
docker build -f pass-log.Dockerfile -t goldbuick/stem-pass-log .
docker build -f terminal-server.Dockerfile -t goldbuick/stem-terminal-server .
popd

pushd ./ui/chat
make clean pack
docker build -t goldbuick/ui-chat .
popd

pushd ./ui/config
make clean pack
docker build -t goldbuick/ui-config .
popd

pushd ./ui/uplink
make clean pack
docker build -t goldbuick/ui-uplink .
popd

docker rmi -f $(docker images | grep "<none>" | awk "{print \$3}")
docker images