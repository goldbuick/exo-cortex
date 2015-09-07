FROM goldbuick/stem-node

# it is expected to run in -net="container:base" mode
CMD ["node", "src/api-xmpp.js", "--control", "localhost:7154"] 
