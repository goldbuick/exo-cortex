FROM mhart/alpine-node
WORKDIR /module

# standard files
ADD package.json package.json
ADD toolkit toolkit
# entry point
ADD pass-chat.js pass-chat.js

# native support -> npm install -> drop native -> clean 
RUN apk-install make gcc g++ python && \
    npm install && \
    apk del make gcc g++ python && \
    rm -rf /tmp/* /root/.npm /root/.node-gyp

# it is expected to run in -net="container:base" mode
CMD ["node", "pass-chat.js", "--control", "localhost:7154"] 
