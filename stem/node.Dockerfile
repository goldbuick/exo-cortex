# base image for all stem- images
FROM mhart/alpine-node
WORKDIR /module

COPY package.json package.json
COPY src src

# native support -> npm install -> drop native -> clean 
RUN apk-install make gcc g++ python && \
    npm install && \
    npm install forever -g && \
    apk del make gcc g++ python && \
    rm -rf /tmp/* /root/.npm /root/.node-gyp