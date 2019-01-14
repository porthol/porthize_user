FROM node:8.9.0-stretch

# Create work dir
RUN mkdir -p /opt/app

# Fix workspace
WORKDIR "/opt/app"

# Copy data to docker image
COPY dist /opt/app/
COPY node_modules /opt/app/
COPY package.json /opt/app/
COPY config /opt/app/

# Expose default port
EXPOSE 3000

# Execute default startup command
CMD [ "/usr/local/bin/npm", "run", "start" ]
