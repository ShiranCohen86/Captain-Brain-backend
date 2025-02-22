const openAiService = require('./openAi.service');
const logger = require('../../services/logger.service')


module.exports = {
  askAiQuestion,
  getAvailableModels,
}

async function askAiQuestion(req, res) {
  try {
    const { userMessage } = req.body
    const { user, messages } = req.session
    const answer = await openAiService.askAiQuestion(userMessage, user, messages)


    if (req.session.messages?.length) {
      req.session.messages.push(...[{ role: "user", content: userMessage }, { role: "system", content: answer }])

    } else {
      req.session.messages = [{ role: "user", content: userMessage }, { role: "system", content: answer }]
      
    }
    console.log("req.session.messages", req.session.messages);


    res.json(answer)
  } catch (err) {
    logger.error('openAi.controller - askAiQuestion -', err)

    res.status(500).json(err);
  }
}
async function getAvailableModels(req, res) {
  try {
    var modelsToReturn = ""
    if (req.session.models) {
      modelsToReturn = req.session.models
    } else {
      modelsToReturn = await openAiService.getAvailableModels()
      req.session.models = modelsToReturn
    }
    res.json(modelsToReturn)
  } catch (err) {
    res.status(500).json(err);
  }
}


