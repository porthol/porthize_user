FROM node:8

# Expose default port
EXPOSE 3000

# Fixe workspace
WORKDIR "/opt/app"

# Copy data to docker image
COPY dist ./dist
COPY config ./config
COPY package.json ./


RUN npm install --save-prod

# Execute default startup command
CMD [ "npm", "run", "start" ]
