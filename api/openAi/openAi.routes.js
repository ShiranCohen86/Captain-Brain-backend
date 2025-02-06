const express = require("express");
const router = express.Router();

const { askAiQuestion, getAvailableModels, consoleLogBackend } = require("./openAi.controller");

router.post("/ask-ai", askAiQuestion);
router.get("/models", getAvailableModels);
router.post("/console", consoleLogBackend);



module.exports = router;
