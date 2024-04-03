# Stage 1: Build
ARG VARIANT="20-bullseye"
FROM mcr.microsoft.com/devcontainers/typescript-node:1-${VARIANT} as build


# Install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    curl git

# [Optional] Uncomment this line to install global node packages.
# RUN su vscode -c "source /usr/local/share/nvm/nvm.sh && npm install -g <your-package-here>" 2>&1

# Stage 2: Base
FROM build AS base

# MUST set WORKDIR before installing with npm and set the NODE_PATH variable
WORKDIR /npm_install
ENV NODE_PATH=/npm_install/node_modules
#ENV PATH="${NODE_PATH}/bin:${PATH}"

# Update npm to a pinned version, if any
ARG NPM_VERSION="none"
RUN if [ "${NPM_VERSION}" != "none" ]; then npm install npm@${NPM_VERSION} -g 2>&1; fi

# Install dependencies (do NOT install "dev" requirements here)
ARG IONIC_CLI_VERSION="7.1.1"
RUN npm install @ionic/cli@${IONIC_CLI_VERSION} -g 2>&1

ARG IONIC_ANGULAR_VERSION="7.5.1"
RUN npm install @ionic/angular@${IONIC_ANGULAR_VERSION} --save 2>&1

# Stage 3a: Development
FROM base AS development

# Install development dependencies

# Stage 3b: Install npm packages
FROM base AS install

WORKDIR /app
COPY mobashi-surv-ui/package*.json .
RUN npm ci

# Stage 3c: Production
FROM install AS production

COPY mobashi-surv-ui .

ARG BASE_HREF="/"
ENV BASE_HREF=${BASE_HREF}
RUN npx ng build --configuration=production --base-href="${BASE_HREF}" --output-path=./www --output-hashing=all