#!/bin/sh

/wait

# Apply Django migrations
python3 manage.py migrate --noinput

# Start Django development server
python3 -u manage.py runserver 0.0.0.0:8080