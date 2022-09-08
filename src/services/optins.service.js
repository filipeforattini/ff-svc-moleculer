const SequelizeAdapter = require("moleculer-db-adapter-sequelize");

const model = require("../models/optin");
const DBService = require('../mixins/db-service.mixin')

const { MYSQL_CONNECTION_STRING } = process.env;

module.exports = {
  name: "optins",
  mixins: [DBService],
  model,

  adapter: new SequelizeAdapter(MYSQL_CONNECTION_STRING),

  events: {
    "amqp://optins.new" (payload) {
      return this.actions.create(payload);
    },
  },
};
