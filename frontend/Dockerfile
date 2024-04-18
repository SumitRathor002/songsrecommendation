FROM node:20

WORKDIR /frontend

# Copy package.json and package-lock.json to the working directory
COPY package.json .
COPY package-lock.json .

RUN npm install


COPY . .

# Expose a port to communicate with the React app
EXPOSE 3000


CMD ["npm", "run", "dev"]