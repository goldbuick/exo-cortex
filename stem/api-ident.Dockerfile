FROM mhart/alpine-node

# standard files
ADD package.json package.json
ADD toolkit toolkit
# entry point
ADD api-ident.js api-ident.js

WORKDIR /src

# native support -> npm install -> drop native -> clean 
RUN apk-install make gcc g++ python && \
    npm install && \
    apk del make gcc g++ python && \
    rm -rf /tmp/* /root/.npm /root/.node-gyp

# it is expected to run in -net="host" mode
CMD ["node", "api-ident.js", "--control", "config:6154"] 
