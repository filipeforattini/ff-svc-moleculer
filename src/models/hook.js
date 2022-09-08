const { DataTypes } = require("sequelize");

module.exports = {
  name: "hooks",

  options: {
    paranoid: true,
  },

  define: {
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    version: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    os: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    platform: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    session: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    ip: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    port: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    page_uri: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
  },
};
