const _ = require("lodash");

const {
  AUTH0_DOMAIN,
  AUTH0_AUDIENCE,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
} = process.env

module.exports = {
  name: "auth0",

  settings: {
    auth0: {
      endpoint: AUTH0_DOMAIN,
      token: null,

      app: {
        audience: AUTH0_AUDIENCE,
        client_id: AUTH0_CLIENT_ID,
        grant_type: 'client_credentials',
        client_secret: AUTH0_CLIENT_SECRET,
      },
    },
  },

  async started() {
    if (await this.auth()) {
      this.logger.info("connected to Auth0");
    } else {
      throw new Error("cannot connect to Auth0");
    }
  },

  actions: {

    validateToken: {
      async handler (ctx) {
        const { token } = ctx.params

        this.actions.getUser({  }, { parentCtx: ctx })
      }
    },

    getUser: {
      async handler (ctx) {
        this.request('api/v2/users')
      }
    }

  },

  methods: {
    async request(path, params = {}) {
      const { endpoint, token } = this.settings.auth0;
      let uri = `${endpoint}/${path}`;

      const options = _.merge({
        method: "GET",
        headers: { 
          "content-type": "application/json"
        },
      }, params);

      if (options.body) options.body = JSON.stringify(options.body);
      if (!params.token && token) options.headers.authorization = `Bearer ${token}`

      this.logger.info(`${options.method} --> ${uri}`);
      return fetch(uri, options);
    },

    async auth() {
      const { app: body } = this.settings.auth0;

      const res = await this.request(`oauth/token`, {
        body,
        method: "POST",
      });

      if (res.ok) {
        const { access_token } = await res.json();
        this.settings.auth0.token = access_token;
        this.logger.info("got token!");
        return true;
      }

      return false;
    },
  },
};
