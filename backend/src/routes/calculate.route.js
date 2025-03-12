const express = require("express");
const { analyzeImage } = require("../services/calculate.service");

const router = express.Router();

router.post("/calculate", async (req, res) => {
  try {
    const { image, dict_of_vars } = req.body;

    const responseData = await analyzeImage(image, dict_of_vars);

    res.json({
      message: "Image processed",
      data: responseData,
      status: "success",
    });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({
      message: "Error processing image",
      error: error.message,
      status: "error",
    });
  }
});

module.exports = router;
