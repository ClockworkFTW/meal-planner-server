const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "johnboyle",
  port: 5432,
  database: "meal_planner"
});

module.exports = pool;
