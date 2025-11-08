# Stage 1: Build the React application
FROM node:16 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the application using a static file server
FROM node:16

WORKDIR /app

# Install `serve`, a static file server
RUN npm install -g serve

# Copy the build output from the build stage
COPY --from=build /app/build .

# Expose port 8080 and start `serve`
EXPOSE 8080
CMD ["serve", "-s", ".", "-l", "8080"]
