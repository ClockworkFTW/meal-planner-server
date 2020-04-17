const express = require("express");
const mealIngredientRoute = express.Router();

const pool = require("../db");

const uniqid = require("uniqid");

// add ingredient
mealIngredientRoute.post("/", async (req, res) => {
  try {
    const { mealId, ingredientId, position } = req.body;

    await pool.query(
      "UPDATE meal_ingredients SET position = position + 1 WHERE (meal_id = $1 AND position >= $2)",
      [mealId, position]
    );

    await pool.query(
      "INSERT INTO meal_ingredients (meal_id, ingredient_id, quantity, position) VALUES($1, $2, $3, $4)",
      [mealId, ingredientId, 1, position]
    );

    res.status(200).end();
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

// remove ingredient
mealIngredientRoute.delete(
  "/:mealId/:ingredientId/:position",
  async (req, res) => {
    try {
      const { mealId, ingredientId, position } = req.params;

      await pool.query(
        "UPDATE meal_ingredients SET position = position - 1 WHERE (meal_id = $1 AND position >= $2)",
        [mealId, position]
      );

      await pool.query(
        "DELETE FROM meal_ingredients WHERE (meal_id = $1 AND ingredient_id = $2)",
        [mealId, ingredientId]
      );

      res.status(200).end();
    } catch (err) {
      console.log(err.message);
      res.status(400).end();
    }
  }
);

// update quantity
mealIngredientRoute.patch("/:mealId/:ingredientId", async (req, res) => {
  try {
    const { mealId, ingredientId } = req.params;
    const { quantity, position } = req.body;

    console.log(position);

    await pool.query(
      "UPDATE meal_ingredients SET quantity = $3, position = $4 WHERE (meal_id = $1 AND ingredient_id = $2)",
      [mealId, ingredientId, quantity, position]
    );

    res.status(200).end();
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = mealIngredientRoute;
