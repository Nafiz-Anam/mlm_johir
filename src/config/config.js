require("dotenv/config");
module.exports = {
    development: {
        databases: {
            mlm_laravel: {
                database: process.env.MYSQL_DB,
                username: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASS,
                host: process.env.MYSQL_HOST,
                port: process.env.MYSQL_PORT,
                dialect: "mysql",
                pool: {
                    max: 1000, // maximum number of connection in pool
                    min: 100, // minimum number of connection in pool
                    acquire: 30000, // maximum time, in milliseconds, that pool will try to get connection before throwing an error
                    idle: 10000, // maximum time, in milliseconds, that a connection can be idle before being released
                },
                retry: {
                    match: [/Deadlock/i],
                    max: 5, // Maximum rety 3 times
                    backoffBase: 1000, // Initial backoff duration in ms. Default: 100,
                    backoffExponent: 1.1, // Exponent to increase backoff each try. Default: 1.1
                },
                // timezone: "Asia/Dhaka",
            },
        },
    },
    production: {
        databases: {
            mlm_laravel: {
                database: process.env.MYSQL_DB,
                username: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASS,
                host: process.env.MYSQL_HOST,
                port: process.env.MYSQL_PORT,
                dialect: "mysql",
                pool: {
                    max: 1000, // maximum number of connection in pool
                    min: 100, // minimum number of connection in pool
                    acquire: 30000, // maximum time, in milliseconds, that pool will try to get connection before throwing an error
                    idle: 10000, // maximum time, in milliseconds, that a connection can be idle before being released
                },
                retry: {
                    match: [/Deadlock/i],
                    max: 5, // Maximum rety 3 times
                    backoffBase: 1000, // Initial backoff duration in ms. Default: 100,
                    backoffExponent: 1.1, // Exponent to increase backoff each try. Default: 1.1
                },
                // timezone: "-5:30",
            },
        },
    },
    DB_PREFIX: "1055_",
};
