const openAiService = require('./openAi.service');

module.exports = {
  askAiQuestion,
  getAvailableModels
}

async function askAiQuestion(req, res) {
  try {
    const { userMessage } = req.body
    const isLoggedUser = req.session.isLogged || 0

    const messagesHis = []
    
    if (isLoggedUser) {
      messagesHis.push(openAiService.getMessagesByUserId(req.session.userId))
    } else {
      
      if (req.session.messages?.length) messagesHis.concat(req.session.messages)
      }
    const role = openAiService.getRoleByMessage(userMessage)
    
    messagesHis.push({ role, content: userMessage })


    const answer = await openAiService.askAiQuestion(userMessage, messagesHis)

    if (!req.session.messages?.length) req.session.messages = []
    req.session.messages.push([{ role: role, content: userMessage }, { role: "system", content: answer }])

    res.json(answer)
  } catch (err) {
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


