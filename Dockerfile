FROM node:11 as builder

WORKDIR "/opt/app"

COPY . ./
RUN npm install
RUN npm run build

FROM node:11 as runner
# Expose default port
EXPOSE 3000

# Fixe workspace
WORKDIR "/opt/app"

# Copy data to docker image
COPY --from=builder /opt/app/dist ./dist
COPY --from=builder /opt/app/config ./config
COPY --from=builder /opt/app/package.json ./

RUN npm install --production

# Execute default startup command
CMD [ "npm", "run", "start" ]
