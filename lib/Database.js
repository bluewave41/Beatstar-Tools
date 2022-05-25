const { Model } = require('objection');
const Knex = require('knex');
require('dotenv').config({ path: '.env.development' });

// Initialize knex.
const knex = Knex({
    client: 'mysql2',
    connection: {
        host : process.env.ip,
		port : 3306,
		database: process.env.database,
		user: process.env.user,
		password: process.env.password
    }
});

Model.knex(knex);