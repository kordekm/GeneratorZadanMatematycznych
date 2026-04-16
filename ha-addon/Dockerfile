ARG BUILD_FROM
FROM $BUILD_FROM

ARG REPO_URL=https://github.com/kordekm/GeneratorZadanMatematycznych

RUN apk add --no-cache nodejs npm git

WORKDIR /app
RUN git clone --depth=1 ${REPO_URL} .

# Buduj backend
WORKDIR /app/backend
RUN npm ci && npm run build

# Buduj frontend (statyczne pliki serwowane przez backend)
WORKDIR /app/frontend
RUN npm ci && npm run build

# Skopiuj zbudowany frontend do katalogu serwowanego przez backend
RUN cp -r dist /app/backend/public

WORKDIR /app
COPY run.sh /run.sh
RUN chmod +x /run.sh

CMD ["/run.sh"]
