const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB_NAME,
});

client.connect();

createRecipe = (values, callback = () => {}) => {
  client.query(
    "INSERT INTO recipe(chain_from, chain_to, address_from, address_to) VALUES($1, $2, $3, $4) RETURNING *",
    values,
    callback
  );
};

getRecipe = (id, callback = () => {}) => {
  client.query(
    {
      // give the query a unique name
      name: "fetch-user",
      text: "SELECT * FROM recipe WHERE id = $1",
      values: [id],
    },
    callback
  );
};

createTransaction = (values, callback = () => {}) => {
  client.query(
    "INSERT INTO transaction_hash(txid, data) VALUES($1, $2) RETURNING *",
    values,
    callback
  );
};

getTransaction = (txid, callback = () => {}) => {
  client.query(
    {
      // give the query a unique name
      name: "fetch-txid",
      text: "SELECT * FROM transaction_hash WHERE txid = $1",
      values: [txid],
    },
    callback
  );
};

module.exports = {
  client,
  createRecipe,
  getRecipe,
  createTransaction,
  getTransaction,
};
