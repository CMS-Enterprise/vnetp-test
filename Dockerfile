FROM ubuntu:latest

RUN apt-get update && apt-get install -y tar && apt-get install -y gzip

WORKDIR /app

RUN mkdir dist
COPY dist/  ./dist/

RUN tar cvf dist.tar dist/automation-ui/*

RUN gzip dist.tar

RUN rm -rf automation-ui

CMD ["ls", "-l"]