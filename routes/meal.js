const express = require("express");
const mealRoute = express.Router();

const pool = require("../db");
const format = require("pg-format");

const uniqid = require("uniqid");

const JOIN_MEAL_INGREDIENTS =
  "SELECT id, name, category, calories, carbs, protein, fat, serving_size, serving_unit, quantity, position FROM ingredients INNER JOIN meal_ingredients ON ingredients.id = meal_ingredients.ingredient_id WHERE meal_ingredients.meal_id = $1";

// get all meals
mealRoute.get("/", async (req, res) => {
  try {
    let meals = await pool.query("SELECT * FROM meals WHERE user_id = 1");

    meals = meals.rows;

    meals = meals.map(async meal => {
      let ingredients = await pool.query(JOIN_MEAL_INGREDIENTS, [meal.id]);

      ingredients = ingredients.rows.map(ingredient => ({
        ...ingredient,
        dragId: uniqid()
      }));

      return { ...meal, dropId: uniqid(), ingredients };
    });

    meals = await Promise.all(meals);

    res.json(meals);
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

// get a meal
mealRoute.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let meal = await pool.query("SELECT * FROM meal WHERE id = $1", [id]);
    meal = meal.rows[0];

    const ingredients = await pool.query(JOIN_MEAL_INGREDIENTS, [id]);

    meal = { ...meal, ingredients: ingredients.rows };

    res.json(meal);
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

// create a meal
mealRoute.post("/", async (req, res) => {
  try {
    const { user, time } = req.body;

    let newMeal = await pool.query(
      "INSERT INTO meals (user_id, name, time) VALUES($1, $2, $3) RETURNING *",
      [user, "Name", time]
    );

    newMeal = { dropId: uniqid(), ...newMeal.rows[0], ingredients: [] };

    res.json(newMeal);
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

// update an meal
mealRoute.patch("/:id", async (req, res) => {
  try {
    // Get meal
    const { id } = req.params;
    const meal = await pool.query("SELECT * FROM meals WHERE id = $1", [id]);

    // Set meal name and time
    let { name, time } = meal.rows[0];
    name = req.body.name || name;
    time = req.body.time || time;

    // Update meal
    let updateMeal = await pool.query(
      "UPDATE meals SET name = $1, time = $2 WHERE id = $3 RETURNING *",
      [name, time, id]
    );

    // Set meal ingredients
    let ingredients = await pool.query(JOIN_MEAL_INGREDIENTS, [id]);
    ingredients = ingredients.rows.map(ingredient => ({
      ...ingredient,
      dragId: uniqid()
    }));

    // Add dropId and ingredients to meal
    updateMeal = {
      dropId: uniqid(),
      ...updateMeal.rows[0],
      ingredients
    };

    // Return updated meal
    res.json(updateMeal);
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

// delete an meal
mealRoute.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM meals WHERE id = $1", [id]);
    res.status(200).end();
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

module.exports = mealRoute;
