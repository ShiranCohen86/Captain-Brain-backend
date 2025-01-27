const chatgptService = require('./chatgpt.service');

module.exports = {
  askAiQuestion,
  getAvailableModels
}

async function askAiQuestion(req, res) {
  try {
    const { messages, selectedModel } = req.body
    const answer = await chatgptService.askAiQuestion(messages, selectedModel)
    res.json(answer)
  } catch (err) {
    res.status(500).json(err);
  }
}

async function getAvailableModels(req, res) {
  try {
    const models = await chatgptService.getAvailableModels()
    res.json(models)
  } catch (err) {
    res.status(500).json(err);
  }
}


