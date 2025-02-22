const express = require("express");
const router = express.Router();

const { askAiQuestion, getAvailableModels } = require("./openAi.controller");

router.post("/ask-ai", askAiQuestion);
router.get("/models", getAvailableModels);

module.exports = router;
