FROM nginx:stable

RUN rm -rf /usr/share/nginx/html/index.html

COPY frontend /usr/share/nginx/html/

RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx/default.conf /etc/nginx/conf.d

#RUN mkdir -p /usr/share/nginx/html/uploads/stickers

#COPY ./mockImages/ /usr/share/nginx/html/uploads/
#COPY ./mockImages/ /usr/share/nginx/html/uploads/stickers