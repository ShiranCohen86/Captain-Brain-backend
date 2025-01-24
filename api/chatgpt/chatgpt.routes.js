const express = require("express");
const router = express.Router();

const { askQuestion } = require("./chatgpt.controller");

router.post("/", askQuestion);

module.exports = router;
