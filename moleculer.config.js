const { Middleware: Channels } = require("@moleculer/channels");

const {
  REDIS_CONNECTION_STRING,
} = process.env;

module.exports = {
  cacher: REDIS_CONNECTION_STRING,
  transporter: REDIS_CONNECTION_STRING,
  
  tracking: {
    enabled: true,
  },

  tracing: {
      enabled: true,
      exporter: "Console",
      events: true,
      stackTrace: true
  },

  registry: {
    discoverer: REDIS_CONNECTION_STRING,
  },

  middlewares: [
    Channels({
      adapter: REDIS_CONNECTION_STRING,
    }),
  ],
};
