const express = require("express");
const mealRoute = express.Router();

const pool = require("../db");
const format = require("pg-format");

const uniqid = require("uniqid");

const JOIN_MEAL_INGREDIENTS =
  "SELECT id, name, category, calories, carbs, protein, fat, serving_size, serving_unit, quantity FROM ingredients INNER JOIN meal_ingredients ON ingredients.id = meal_ingredients.ingredient_id WHERE meal_ingredients.meal_id = $1";

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

// create and meal
mealRoute.post("/", async (req, res) => {
  try {
    const { name, time, difficulty, ingredients } = req.body;

    let newMeal = await pool.query(
      "INSERT INTO meal (name, time, difficulty) VALUES($1, $2, $3) RETURNING *",
      [name, time, difficulty]
    );

    newMeal = newMeal.rows[0];

    const mealIngredients = ingredients.map(ingredient => [
      newMeal.id,
      ingredient.id,
      ingredient.quantity
    ]);

    let INSERT_MEAL_INGREDIENTS = format(
      "INSERT INTO meal_ingredients (meal_id, ingredient_id, quantity) VALUES %L",
      mealIngredients
    );

    await pool.query(INSERT_MEAL_INGREDIENTS);

    const ing = await pool.query(JOIN_MEAL_INGREDIENTS, [newMeal.id]);

    newMeal = { ...newMeal, ingredients: ing.rows };

    res.json(newMeal);
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

// update an meal
mealRoute.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, time, difficulty, steps, flavors, ingredients } = req.body;
    const updateMeal = await pool.query(
      "UPDATE meal SET name = $1, time = $2, difficulty = $3, steps = $4, flavors = $5, ingredients = $6 WHERE id = $7 RETURNING *",
      [name, time, difficulty, steps, flavors, ingredients, id]
    );
    res.json(updateMeal.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

// delete an meal
mealRoute.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM meal WHERE id = $1", [id]);
    res.status(200).end();
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
  }
});

module.exports = mealRoute;
