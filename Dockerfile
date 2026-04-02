FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

# Ensure upload directories exist
RUN mkdir -p uploads/ssn_cards uploads/payment_receipts

# Expose the API port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
