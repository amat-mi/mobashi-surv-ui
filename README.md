# Mobashi-SURV UI

Client SURV of the Mobashi system.

# Installation

## Configuration for production

To build a new version of the frontend files, run the following commands:

    docker compose build --build-arg BASE_HREF="/ui/"
    docker compose up -d
    docker cp mobashi-surv-ui:/app/www /var/local/mnt/mobashi-surv-ui
    docker compose down




    docker compose run mobashi-surv-ui /bin/bash

After the build terminate, the fronted files are available inside directory:

Arguments __BASE_HREF__ and __BASE_DIRECTORY__ must be set along the configuration of the Web server,
installed the host machine, that is going to serve the frontend files.

If not given, default values are used as shown above (see inside __docker-compose.yml__ file).

For example (using Nginx):

    location /ui/ {
        /var/local/mnt/mobashi-surv-ui
    }

# Development

## Running

In case of problems while running from VSCode, use the following command:

    npx ionic serve --no-open --external --port=4102 --configuration=development