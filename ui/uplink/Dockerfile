FROM goldbuick/exostatic

ADD public/ /var/www
ADD favicon.ico /var/www/favicon.ico
ADD views/index-optimize.html /var/www/index.html

CMD ["nginx", "-g", "daemon off;"]