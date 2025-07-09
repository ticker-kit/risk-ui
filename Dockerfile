FROM node:22.17.0-alpine

WORKDIR /app

ARG MODE

COPY package.json ./
RUN npm install

COPY . .

# Conditionally run build with mode
RUN if [ -n "$MODE" ]; then \
      echo "Building with mode=$MODE" && \
      npm run build -- --mode $MODE ; \
    else \
      npm run build ; \
    fi

RUN npm i -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist"]
