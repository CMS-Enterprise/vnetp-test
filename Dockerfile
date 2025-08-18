FROM nginx:1.29.1-alpine
COPY dist/automation-ui/ /usr/share/nginx/html/