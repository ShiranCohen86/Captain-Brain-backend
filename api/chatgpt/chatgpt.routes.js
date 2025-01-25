const express = require("express");
const router = express.Router();

const { askQuestion,getModels } = require("./chatgpt.controller");

router.post("/", askQuestion);
router.get("/models", getModels);



module.exports = router;
