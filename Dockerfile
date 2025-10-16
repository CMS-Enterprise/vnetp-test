FROM nginx:1.29.1-alpine
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/automation-ui/ /usr/share/nginx/html/