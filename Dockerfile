FROM Node.js:16.14.2
COPY main.html /Group-Project-Software-Engineering-/main.html
EXPOSE 80
LABEL MAINTAINER "Emil Runcan <runcane@roehampton.ac.uk"
USER root
RUN main.html
WORKDIR /Group-Project-Software-Engineering-