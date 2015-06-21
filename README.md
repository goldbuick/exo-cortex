![exo-cortex](https://raw.githubusercontent.com/goldbuick/exo-cortex/master/logo.png)

A Weird IOT toolkit
===================

My primary goal is to build a collection of Dockerfiles you can use to deploy your own
IOT setup.

The server nodes are currently based off of nodejs. And I use http://mimosa.io/ to develop the front-end code.

## v0 roadmap - complete
* stem/config-server - complete, generic config & discovery store
* stem/api-irc - complete, integrate with irc channels
* stem/toolkit - complete, initial config protocol worked out
* ui/config - complete, front-end for config-server

## v1 roadmap - complete
* stem/api-irc - complete, complete irc api and generated events
* stem/pass-log - complete, generic event logger backed by rethinkdb
* ui/chat - complete, front-end to drive any api nodes that support chat coms

## v2 roadmap
* stem/api-webhook, generate events from webhooks
* stem/api-trigger, generate html get/post requests
* ui/chat, add channel topic and userlists

## v3 roadmap
* stem/api-messages, integrate with apple messages
* stem/api-xmpp, integrate with still functioning google talk
* stem/api-slack, integrate with slack teams
