const openAiService = require('./openAi.service');

module.exports = {
  askAiQuestion,
  getAvailableModels,
}

async function askAiQuestion(req, res) {
  try {
    const { userMessage } = req.body
    const userId = req.session?.user?._id
    
    const answer = await openAiService.askAiQuestion(userMessage,userId)
    

    /*
        if (req.session.messages?.length) {
          req.session.messages.push(...[{ role: role, content: userMessage }, { role: "system", content: answer }])
    
        } else {
          req.session.messages = [{ role: role, content: userMessage }, { role: "system", content: answer }]
        }
        console.log("laaasss", answer);
    
      */
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


