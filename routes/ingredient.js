const express = require("express");
const ingredientRouter = express.Router();

const pool = require("../db");

// get all ingredients
ingredientRouter.get("/", async (req, res) => {
  try {
    const ingredients = await pool.query(
      "SELECT * FROM ingredients WHERE user_id = 1"
    );
    res.json(ingredients.rows);
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

// get an ingredient
ingredientRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const ingredient = await pool.query(
      "SELECT * FROM ingredients WHERE id = $1",
      [id]
    );
    res.json(ingredient.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

// create and ingredient
ingredientRouter.post("/", async (req, res) => {
  try {
    const { name, calories, carbs, fat, protein, serving, unit } = req.body;
    const newIngredient = await pool.query(
      "INSERT INTO ingredients (name, calories, carbs, fat, protein, serving, unit) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [name, calories, carbs, fat, protein, serving, unit]
    );
    res.json(newIngredient.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

// update an ingredient
ingredientRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, calories, carbs, fat, protein, serving, unit } = req.body;
    const updateIngredient = await pool.query(
      "UPDATE ingredients SET name = $1, calories = $2, carbs = $3, fat = $4, protein = $5, serving = $6, unit = $7 WHERE id = $8 RETURNING *",
      [name, calories, carbs, fat, protein, serving, unit, id]
    );
    res.json(updateIngredient.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

// delete an ingredient
ingredientRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM ingredients WHERE id = $1", [id]);
    res.status(200).end();
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

module.exports = ingredientRouter;
