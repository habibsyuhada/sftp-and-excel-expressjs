// db.js

const { Client } = require('pg');

const dbConfig_portal = {
  user: 'user',
  host: 'host',
  database: 'database',
  password: 'password',
  port: 5432,
};

const dbConfig_appv2 = {
  user: 'user',
  host: 'host',
  database: 'database',
  password: 'password',
  port: 5432,
};

const dbConfig_engineering = {
  user: 'user',
  host: 'host',
  database: 'database',
  password: 'password',
  port: 5432,
};

const getClient = (config) => {
  const client = new Client(config);

  client.connect()
    .then(() => console.log(`Connected to ${config.database}`))
    .catch(err => console.error(`${config.database} connection error`, err));

  return client;
};

const db_portal = getClient(dbConfig_portal);
const db_eng = getClient(dbConfig_engineering);
const db_appv2 = getClient(dbConfig_appv2);

module.exports = {
  db_portal,
  db_eng,
  db_appv2,
};
