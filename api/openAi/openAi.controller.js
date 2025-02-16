const openAiService = require('./openAi.service');

module.exports = {
  askAiQuestion,
  getAvailableModels,
  consoleLogBackend
}

function consoleLogBackend(req, res) {
  try {
    console.dir(req.body);



    res.json("")
  } catch (err) {
    res.status(500).json(err);
  }
}


async function askAiQuestion(req, res) {
  try {
    console.log("req.body", req.body);

    const { userMessage } = req.body
    const isLoggedUser = req.session.isLogged || 0

    const messagesHis = []

    if (isLoggedUser) {
      messagesHis.push(openAiService.getMessagesByUserId(req.session.userId))
    } else {
      if (req.session.messages?.length) {
        messagesHis.push(...req.session.messages)
      }
    }

    const role = openAiService.getRoleByMessage(userMessage)
    messagesHis.push({ role, content: userMessage })

    const answer = await openAiService.askAiQuestion(userMessage, messagesHis)

    if (req.session.messages?.length) {
      req.session.messages.push(...[{ role: role, content: userMessage }, { role: "system", content: answer }])

    } else {
      req.session.messages = [{ role: role, content: userMessage }, { role: "system", content: answer }]
    }

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


