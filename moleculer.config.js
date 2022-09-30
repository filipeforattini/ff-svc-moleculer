const RabbitMQ = require("./src/middlewares/rabbitmq.middleware");

const {
  // generic config
  MOLECULER_CACHER,
  MOLECULER_TRANSPORTER,
  MOLECULER_REGISTRY,

  // specific config
  REDIS_CONNECTION_STRING,
  NATS_CONNECTION_STRING,
  ETCD_CONNECTION_STRING,

  RABBITMQ_CONNECTION_STRING,
  RABBITMQ_PREFETCH = "3",
} = process.env;

module.exports = {
  hotReload: true,
  cacher: MOLECULER_CACHER || REDIS_CONNECTION_STRING,
  transporter: MOLECULER_TRANSPORTER || NATS_CONNECTION_STRING || REDIS_CONNECTION_STRING,

  registry: {
    discoverer: MOLECULER_REGISTRY || ETCD_CONNECTION_STRING || REDIS_CONNECTION_STRING,
  },

  middlewares: [
    RabbitMQ({
      uri: RABBITMQ_CONNECTION_STRING,
      prefetch: parseInt(RABBITMQ_PREFETCH),
    }),
  ],
};
