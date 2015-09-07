# base image for all stem- images
FROM mhart/alpine-node
WORKDIR /module

ADD package.json package.json
ADD src src

# native support -> npm install -> drop native -> clean 
RUN apk-install make gcc g++ python && \
    npm install && \
    apk del make gcc g++ python && \
    rm -rf /tmp/* /root/.npm /root/.node-gyp