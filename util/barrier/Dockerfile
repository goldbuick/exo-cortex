FROM alpine:3.2
RUN apk add --update nginx && rm -rf /var/cache/apk/*
RUN mkdir -p /tmp/nginx/client-body

COPY nginx.conf /etc/nginx/nginx.conf
VOLUME [ "/var/nginx" ]

EXPOSE 70 7080

CMD ["nginx", "-g", "daemon off;"]
