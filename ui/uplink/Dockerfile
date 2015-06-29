FROM goldbuick/util-static

ADD public /var/www
ADD favicon.ico /var/www/favicon.ico
ADD views/index-docker.html /var/www/index.html
RUN chown -R nginx /var/www

CMD ["nginx", "-g", "daemon off;"]