const express = require("express");
const router = express.Router();
const { routes } = require("../data/routes");

router.get("/", (req, res) => {
  res.json(routes);
});

module.exports = router;
