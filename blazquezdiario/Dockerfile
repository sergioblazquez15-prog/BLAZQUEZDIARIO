FROM node:20-alpine
WORKDIR /app
COPY server.js ./
COPY public ./public
ENV NODE_ENV=production PORT=3080 DATA_DIR=/app/data
EXPOSE 3080
HEALTHCHECK --interval=60s --timeout=5s CMD wget -qO- http://127.0.0.1:3080/api/health || exit 1
CMD ["node", "server.js"]
