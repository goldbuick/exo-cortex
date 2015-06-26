FROM mhart/alpine-node

WORKDIR /src
# standard files
ADD ../../stem/package.json .
ADD ../../stem/toolkit ./toolkit
# entry point
ADD ../../stem/config-server.js config-server.js

# for modules with native code
RUN apk-install make gcc g++ python

# install deps
RUN npm install

# remove native build tools
RUN apk del make gcc g++ python && \
  rm -rf /tmp/* /root/.npm /root/.node-gyp

# for config & terminal this is different
# otherwise it's 3000
EXPOSE 7154

# boot it
CMD ["node", "config-server.js", "--rethinkdb", "rethinkdb:28015"] 
