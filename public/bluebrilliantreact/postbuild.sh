#!/bin/bash

# Define the paths
REACT_BUILD_DIR="./build"
DJANGO_TEMPLATES_DIR="../templates"

# Move the index.html to Django's templates directory
mv "$REACT_BUILD_DIR/index.html" "$DJANGO_TEMPLATES_DIR"