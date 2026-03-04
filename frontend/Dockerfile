FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

# We do NOT copy source files here if we are using volumes for dev,
# but it's good practice to have them for the build context or if volume fails.
COPY . .

# React dev server port
EXPOSE 3000

CMD ["npm", "start"]
