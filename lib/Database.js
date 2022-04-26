const { Model } = require('objection');
const Knex = require('knex');
require('dotenv').config({ path: '.env.development' });

// Initialize knex.
const knex = Knex({
    client: 'mysql2',
    connection: {
        host : '143.110.226.4',
		port : 3306,
		database: process.env.database,
		user: process.env.user,
		password: process.env.password
    }
});

Model.knex(knex);