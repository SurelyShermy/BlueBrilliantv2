# Stage 1: Build the React application
FROM node:latest as react-build
WORKDIR /app
COPY ./public/bluebrilliantreact/package.json ./public/bluebrilliantreact/package-lock.json ./
RUN npm install
COPY ./public/bluebrilliantreact/ ./
RUN npm run build

# Stage 2: Set up the Django application
FROM python:3.12
ENV HOME /root
WORKDIR /app

# Copy the built React app from the previous stage
COPY --from=react-build /app/build/ /app/public/bluebrilliantreact/build/

# Copy the rest of your Django application
COPY . .

# Install Django dependencies
RUN pip3 install -r requirements.txt

# Move the React build's index.html to the Django templates directory
RUN mv /app/public/bluebrilliantreact/build/index.html /app/public/templates/

EXPOSE 8080

# Your existing commands to wait, migrate, and start the Django server
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

CMD /wait && python3 manage.py migrate && python3 manage.py runserver 0.0.0.0:8080
