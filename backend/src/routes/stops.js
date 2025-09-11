const express = require("express");
const { stops } = require("../data/stops");

const router = express.Router();

router.get("/", (req, res) => {
  const routeId = req.query.route;
  if (!routeId || !stops[routeId]) return res.status(400).json({ error: "Invalid route ID" });
  res.json(stops[routeId]);
});

module.exports = router;
