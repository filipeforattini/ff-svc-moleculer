const { ServiceBroker } = require("moleculer");

const api = require("./services/api.service");
const beef = require("./services/beef.service");
const auth0 = require("./services/auth0.service");
const hooks = require("./services/hooks.service");
const optins = require("./services/optins.service");

module.exports = (config) => {
  const broker = new ServiceBroker(config);

  [
    api,
    beef,
    auth0,
    hooks,
    optins,
  ].map((svc) => broker.createService(svc));

  return broker;
};
