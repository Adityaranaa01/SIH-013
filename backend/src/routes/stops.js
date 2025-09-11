const express = require("express");
const router = express.Router();
const { stops } = require("../data/stops");

router.get("/", (req, res) => {
  const routeId = req.query.route;
  if (stops[routeId]) {
    res.json(stops[routeId]);
  } else {
    res.status(404).json({ error: "Route not found" });
  }
});

module.exports = router;
