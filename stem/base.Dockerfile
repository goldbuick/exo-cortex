FROM mhart/alpine-node
WORKDIR /module

# standard files
ADD package.json package.json
ADD toolkit toolkit
# base nodes
ADD base.js base.js
ADD config-server.js config-server.js
ADD terminal-server.js terminal-server.js

# native support -> npm install -> drop native -> clean 
RUN apk-install make gcc g++ python && \
    npm install && \
    apk del make gcc g++ python && \
    rm -rf /tmp/* /root/.npm /root/.node-gyp

EXPOSE 7154 26154
CMD ["node", "base.js"] 
