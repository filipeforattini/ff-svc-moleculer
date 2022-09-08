const _ = require("lodash");
const qs = require("qs")

const { BEEF_CONNECTION_STRING } = process.env;

module.exports = {
  name: "beef",

  settings: {
    beef: {
      connectionString: BEEF_CONNECTION_STRING,
      endpoint: null,
      token: null,
      
      credentials: {
        username: "beef",
        password: null,
      },

      endpoints: {
        AUTH: "api/admin/login",
        HOOKS_INDEX: "api/hooks",
      },
    },
  },

  created() {
    const { connectionString } = this.settings.beef;
    const { origin, password, username } = new URL(connectionString);

    this.settings.beef.endpoint = origin;
    this.settings.beef.credentials = {
      username,
      password,
    };
  },

  async started() {
    if (await this.auth()) {
      this.logger.info("connected to BeEF");
    } else {
      throw new Error("cannot connect to BeEF");
    }
  },

  actions: {

    hooks: {
      async handler (ctx) {
        const hooks = await this.hooksIndex()
        return hooks
      }
    },

  },

  methods: {
    async request(path, params = {}) {
      const { endpoint, token } = this.settings.beef;

      let uri = `${endpoint}/${path}`;
      if (token) uri += `?token=${token}`

      const options = _.merge({
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }, params);

      if (options.body) options.body = JSON.stringify(options.body);

      this.logger.info(`${options.method} --> ${uri}`);
      return fetch(uri, options);
    },

    async auth() {
      const { credentials, endpoints: { AUTH }} = this.settings.beef;

      const res = await this.request(AUTH, {
        method: "POST",
        body: credentials,
      });

      if (res.ok) {
        const data = await res.json();
        this.settings.beef.token = data.token;
        this.logger.info("got token!");
        return true;
      }

      return false;
    },

    async hooksIndex() {
      const { endpoints: { HOOKS_INDEX }} = this.settings.beef;

      const res = await this.request(HOOKS_INDEX, { methoh: 'GET'})

      if (res.ok) {
        return res.json()
      }

      throw new Error(res)
    },
  },
};
