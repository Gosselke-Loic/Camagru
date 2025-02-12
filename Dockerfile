FROM nginx:latest

RUN rm -rf /usr/share/nginx/html/index.html

COPY frontend /usr/share/nginx/html/

RUN rm /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d