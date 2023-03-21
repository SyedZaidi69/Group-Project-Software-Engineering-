FROM node.js:16.14.2
COPY . /SE Group Project/
EXPOSE 3000
LABEL MAINTAINER "Emil Runcan <runcane@roehampton.ac.uk"
RUN main.html