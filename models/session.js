const Sequelize = require('sequelize');

const sequelize = require('../utils/getSequelizeInstance');

const Session = sequelize.define("Session", {
    sid: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    userId: Sequelize.STRING,
    expires: Sequelize.DATE,
    data: Sequelize.TEXT,
});

module.exports = Session;
