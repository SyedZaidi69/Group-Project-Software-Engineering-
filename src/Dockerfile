# Use Node JS v16.x as base image
FROM node:18.14.2

# Create server directory inside image
WORKDIR /

# Copy the source code
COPY . .

# Install dependencies
RUN npm install

# Expose server port
EXPOSE 8081

# Start server using npm script
CMD [ "npm", "run", "start" ]