const chatgptService = require('./chatgpt.service');

module.exports = {
  askQuestion
}

async function askQuestion(req, res) {
  try {
    const messages = req.body
    const resData = await chatgptService.askQuestion(messages)
    
    res.json(resData.data.choices[0].message.content)
  } catch (err) {
    //console.log("Function askQuestion chatgpt.controller",err.response);

    if (err.response?.data) {
      console.log("chatgpt.controller - ",err.response.data.error);
      //res.status(500).json(err.response.data.error);
    } else {
      //console.log(err);
      res.status(500).json(err);
    }
  }
}


