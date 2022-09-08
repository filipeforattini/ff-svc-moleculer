const ApiService = require("moleculer-web");

const { PORT = "8080" } = process.env;

module.exports = {
  name: "api",
  mixins: [ApiService],

  settings: {
    port: parseInt(PORT),

    cors: {
      methods: ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"],
      origin: "*",
    },

    routes: [
      {
        autoAliases: true,
        path: "/",
        aliases: {
          "REST /hooks": "hooks",
          "REST /optins": "optins",
          "GET /beef/hooks": "beef.hooks",
        },
      },
    ],
  },
};
