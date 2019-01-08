FROM node:8.9.0-stretch

# Copy data to docker image
RUN mkdir -p /home/node/app
COPY . /home/node/app

# Fix workspace
WORKDIR "/home/node/app"

# Expose default port
EXPOSE 3000

# Execute default startup command
CMD [ "/usr/local/bin/npm", "run", "start" ]
