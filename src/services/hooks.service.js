const SequelizeAdapter = require("moleculer-db-adapter-sequelize");

const model = require("../models/hook");
const DBService = require('../mixins/db-service.mixin')

const { MYSQL_CONNECTION_STRING } = process.env;

module.exports = {
  name: "hooks",
  mixins: [DBService],
  model,

  adapter: new SequelizeAdapter(MYSQL_CONNECTION_STRING),

  events: {
    "amqp://hooks.new" (payload) {
      return this.actions.create(payload);
    },
  },
};
