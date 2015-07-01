![exo-cortex](https://raw.githubusercontent.com/goldbuick/exo-cortex/master/logo.png)

A self-hosted IOT toolkit
=========================

My primary goal is to build a collection of Dockerfiles you can use to deploy your own IOT setup.
https://github.com/goldbuick/deploy-exo-cortex will be a nodejs based management app for deploying exo.

So in the future the setup will be:
* install docker
* npm -g install deploy-exo-cortex
* run deploy-exo-cortex in folder where you plan on keeping your settings / data

The server nodes are currently based off of nodejs. And I use http://mimosa.io/ to develop the front-end code.

## 0.0.0 - complete
* stem/config-server - complete, generic config & discovery store
* stem/api-irc - complete, integrate with irc channels
* stem/toolkit - complete, initial config protocol worked out
* ui/config - complete, front-end for config-server

## 0.1.0 - complete
* stem/api-irc - complete, complete irc api and generated events
* stem/pass-log - complete, generic event logger backed by rethinkdb
* ui/chat - complete, front-end to drive any api nodes that support chat coms

## 0.1.5 - complete
* auth/proxy - complete, put access to stem/ui behind an authenticated proxy
* docker - complete, begin putting together deployable docker images

## 0.2.0
* ui/chat, add channel topic, username lists, attempt tab-to-complete usernames
* stem/api-xmpp, integrate with still functioning google talk
* stem/api-messages, integrate with apple messages

## 0.3.0
* stem/api-webhook, generate events from webhooks
* stem/api-trigger, generate html get/post requests
* stem/terminal-blocks, expose webhooks and triggers as simple binary switches

## 0.4.0
* stem/terminal-sim, a 3d space whereby blocks are place to interact with each other
* ui/uplink, a visual interface to terminal-sim, whereby an authenticated user can edit the sim

## 0.5.0
* ??? 0.4.0 will probably take a while

## 0.8.0
* stem/api-slack, integrate with slack teams
