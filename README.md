![exo-cortex](https://raw.githubusercontent.com/goldbuick/exo-cortex/master/logo.png)

Internet of things, for anyone
==============================

My primary goal is to build a collection of Dockerfiles you can use to deploy your own
IOT setup.

The server nodes are currently based off of nodejs. And I use http://mimosa.io/ to develop the front-end code.

### v0 status
* stem/config-server, generic config & discovery store
* ui/config, front-end for config-server
* stem nodes are beginning to work
* nailed down the approach for nodes to interact with their config
* still need to finish the upstream config on stem/config-server

### v1 roadmap
* stem/api-irc, complete irc api and generated events
* stem/pass-log, generic event logger backed by rethinkdb
* ui/chat, front-end to drive any api nodes that support chat coms

### v2 roadmap
* stem/api-xmpp, integrate with still functioning google talk
* stem/api-slack, integrate with slack teams
