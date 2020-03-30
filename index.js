const express = require("express");
const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTES
const ingredientRouter = require("./routes/ingredient");
app.use("/ingredients", ingredientRouter);

const mealRouter = require("./routes/meal");
app.use("/meals", mealRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
