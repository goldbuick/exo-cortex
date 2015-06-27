FROM alpine:3.2

RUN apk add --update nginx && \
    rm -rf /var/cache/apk/* && \
    mkdir /etc/nginx/ssl && \
    mkdir /tmp/nginx && \
    mkdir -p /tmp/nginx/client-body

COPY index.html /var/www/index.html
COPY nginx.conf /etc/nginx/nginx.conf
COPY mime.types /etc/nginx/mime.types
COPY default /etc/nginx/sites-enabled/default
COPY default-ssl /etc/nginx/sites-available/default-ssl

VOLUME [ "/var/nginx" ]

WORKDIR /etc/nginx

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
