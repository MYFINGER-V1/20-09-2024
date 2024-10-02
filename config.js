require('dotenv').config();

module.exports = {
    app: {
        port: process.env.PORT || 8096,
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'notasecreta!'
    },
    mysql: {
        host: process.env.MYSQL_HOST || 'bfazi0xequlec8sdwfbh-mysql.services.clever-cloud.com',
        user: process.env.MYSQL_USER || 'uwxga0mnkfrmodb2',
        password: process.env.MYSQL_PASSWORD || 'XPi9bX34iSuMfOa70mJN',
        database: process.env.MYSQL_DB || 'bfazi0xequlec8sdwfbh',
        port: process.env.MYSQL_PORT || 3306 
    }
}
