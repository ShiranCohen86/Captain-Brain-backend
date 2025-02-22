const openAiService = require('./openAi.service');
const logger = require('../../services/logger.service')


module.exports = {
  askAiQuestion,
  getAvailableModels,
}

async function askAiQuestion(req, res) {
  try {
    const { userMessage } = req.body
    const { user, conversation } = req.session
    const resObj = await openAiService.askAiQuestion(userMessage, user, conversation)


    if (req.session?.conversation?.messages) {

      req.session.conversation.messages.push(...[{ role: "user", content: userMessage }, { role: "system", content: resObj.answer }])

    } else {
      req.session.conversation = {
        _id: resObj.conversionId,
        messages: [{ role: "user", content: userMessage }, { role: "system", content: resObj.answer }]
      }
    }

    res.json(resObj.answer)
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


