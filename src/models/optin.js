const { DataTypes } = require("sequelize");

module.exports = {
  name: "optins",

  options: {
    paranoid: true,
  },

  define: {
    ip: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },

    // importante
    cpf: {
      type: DataTypes.STRING(11),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    signedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    // complementar
    nickname: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    picture: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
    rawUser: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
};