FROM python:3.12
ENV HOME /root
WORKDIR /app
COPY . .
# Download dependancies
RUN pip3 install -r requirements.txt
EXPOSE 8080

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

CMD /wait && python3 -u manage.py runserver 0.0.0.0:8080