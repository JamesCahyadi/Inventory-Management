const { Pool } = require('pg');
require('dotenv').config();

const devConfig = {
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT
};

const prodConfig = {
    connectionString: process.env.DATABASE_URL // comes from heroku
}

const pool = new Pool(process.env.NODE_ENV === 'production' ? prodConfig : devConfig);

module.exports = pool;