FROM mhart/alpine-node
WORKDIR /module

# standard files
ADD package.json package.json
ADD toolkit toolkit
# entry point
ADD config-server.js config-server.js

# native support -> npm install -> drop native -> clean 
RUN apk-install make gcc g++ python && \
    npm install && \
    apk del make gcc g++ python && \
    rm -rf /tmp/* /root/.npm /root/.node-gyp

EXPOSE 7154 26154
CMD ["node", "config-server.js", "--rethinkdb", "rethinkdb:28015"] 
