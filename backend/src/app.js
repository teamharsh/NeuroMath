require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/", require("./routes/calculate.route"));

app
  .listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  })
  .on("error", (err) => {
    console.error("Error starting server: ", err.message);
  });
