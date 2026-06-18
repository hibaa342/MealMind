# Step 1: Use an official lightweight Node.js image
FROM node:18-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Step 4: Copy the rest of your backend source code
COPY . .

# Step 5: Expose the port your app runs on
EXPOSE 5000

# Step 6: Start your Node.js application
CMD ["node", "index.js"]