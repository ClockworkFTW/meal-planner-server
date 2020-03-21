const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTES

// get all ingredients
app.get("/ingredients", async (req, res) => {
  try {
    const ingredients = await pool.query("SELECT * FROM ingredient");
    res.json(ingredients.rows);
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

// get an ingredient
app.get("/ingredients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const ingredient = await pool.query(
      "SELECT * FROM ingredient WHERE id = $1",
      [id]
    );
    res.json(ingredient.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

// create and ingredient
app.post("/ingredients", async (req, res) => {
  try {
    const { name, calories, carbs, fat, protein, serving, unit } = req.body;
    const newIngredient = await pool.query(
      "INSERT INTO ingredient (name, calories, carbs, fat, protein, serving, unit) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [name, calories, carbs, fat, protein, serving, unit]
    );
    res.json(newIngredient.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

// update an ingredient
app.put("/ingredients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, calories, carbs, fat, protein, serving, unit } = req.body;
    const updateIngredient = await pool.query(
      "UPDATE ingredient SET name = $1, calories = $2, carbs = $3, fat = $4, protein = $5, serving = $6, unit = $7 WHERE id = $8 RETURNING *",
      [name, calories, carbs, fat, protein, serving, unit, id]
    );
    res.json(updateIngredient.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

// delete an ingredient
app.delete("/ingredients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM ingredient WHERE id = $1", [id]);
    res.status(200).end();
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
