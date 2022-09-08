const _ = require('lodash')

const {
  DIRECTDIGITAL_URL = 'https://api.directdigital.com.br',
  DIRECTDIGITAL_TOKEN,
} = process.env

module.exports = {
  name: 'directdigital-api-cpf',  
  mixins: [],
  
  settings: {
    debug: true,

    axios: {
      config: {
        baseURL: DIRECTDIGITAL_URL,
      },

      requestConfig: {
        params: {
          format: 'json',
          token: DIRECTDIGITAL_TOKEN,
        }
      },
    },

    endpoints: {
      cadastroPessoaFisica: '/cadastro/pessoa-fisica',
      exatoRendaPresumida: '/br/exato/renda-presumida/pessoa-fisica',
      receitaFederalCpf: '/receita-federal-cadastro/cpf-sem-nascimento',
    }
  },

  actions: {

    all: {
      cache: false,
      
      params: {
        cpf: 'string|length:11',
      },

      async handler (ctx) {
        const { cpf } = ctx.params
        const meta = { meta: { $cache: false }}

        const infos = await Promise.all([
          ctx.call('directdigital-api-cpf.data', { cpf }, meta),
          ctx.call('directdigital-api-cpf.wage', { cpf }, meta),
          ctx.call('directdigital-api-cpf.government', { cpf }, meta),
        ])

        return _.merge(...infos)
      }
    },

    data: {
      cache: false,

      params: {
        cpf: 'string|length:11',
      },

      async handler (ctx) {
        const { cpf } = ctx.params
        
        const { data } = await this.client.get(this.settings.endpoints.cadastroPessoaFisica, { params: { 
          cpf,
          relacionados: true,
        }})
  
        return data
          ? data.Result
          : null
      }
    },

    wage: {
      cache: false,

      params: {
        cpf: 'string|length:11',
      },

      async handler (ctx) {
        const { cpf } = ctx.params
        const { data } = await this.client.get(this.settings.endpoints.exatoRendaPresumida, { params: { cpf }})
  
        return data
          ? data.Result
          : null
      }
    },

    government: {
      cache: false,

      params: {
        cpf: 'string|length:11',
      },

      async handler (ctx) {
        const { cpf } = ctx.params

        const { data } = await this.client.get(this.settings.endpoints.receitaFederalCpf, { params: { cpf }})
  
        return data
          ? data.Result
          : null
      }
    },

  },
}
