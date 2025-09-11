const express = require("express");
const { routes } = require("../data/routes");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(routes);
});

module.exports = router;
