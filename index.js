const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const navigateCoopPages = require("./coop/coopPageNavigation.js");

const app = express();

dotenv.config();

mongoose.connect(
  process.env.MONGO_DB_CONNECTION,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => (err ? console.error(err) : console.log("Connected to DB"))
);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/product", require("./routers/product.router"));
