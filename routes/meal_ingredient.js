const express = require("express");
const mealIngredientRoute = express.Router();

const pool = require("../db");

const uniqid = require("uniqid");

// add ingredient
mealIngredientRoute.post("/:mealId/:ingredientId", async (req, res) => {
  try {
    const { mealId, ingredientId } = req.params;

    await pool.query(
      "INSERT INTO meal_ingredients (meal_id, ingredient_id, quantity) VALUES($1, $2, $3)",
      [mealId, ingredientId, 1]
    );

    res.status(200).end();
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

// remove ingredient
mealIngredientRoute.delete("/:mealId/:ingredientId", async (req, res) => {
  try {
    const { mealId, ingredientId } = req.params;

    await pool.query(
      "DELETE FROM meal_ingredients WHERE (meal_id = $1 AND ingredient_id = $2)",
      [mealId, ingredientId]
    );

    res.status(200).end();
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

// update quantity
mealIngredientRoute.patch("/:mealId/:ingredientId", async (req, res) => {
  try {
    const { mealId, ingredientId } = req.params;
    const { quantity } = req.body;

    await pool.query(
      "UPDATE meal_ingredients SET quantity = $3 WHERE (meal_id = $1 AND ingredient_id = $2)",
      [mealId, ingredientId, quantity]
    );

    res.status(200).end();
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = mealIngredientRoute;
