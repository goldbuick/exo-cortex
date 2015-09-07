FROM goldbuick/stem-node

# it is expected to run in -net="container:base" mode
CMD ["node", "src/pass-chat.js", "--control", "localhost:7154"] 
