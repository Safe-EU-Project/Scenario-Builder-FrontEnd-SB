FROM node:latest 

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .


# Start React dev server
CMD ["npm", "run", "dev", "--", "--host"]

