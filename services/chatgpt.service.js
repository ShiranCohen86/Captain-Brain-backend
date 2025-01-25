const logger = require('./logger.service');
const Axios = require('axios');

const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = "gpt-4o"

async function fetchChatResponse({ messages, selectedModel }) {
  selectedModel = selectedModel 
  console.log({selectedModel});
  

  try {
    return await Axios.post(
      API_URL,
      {
        model: selectedModel,
        messages: messages,
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    logger.error("Do Http Request", err.response?.data);
    throw err
  }
}

async function getModels() {
  try {
    const modelList = await Axios.get("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    return modelList.data.data
  } catch (err) {
    logger.error("Do Http Request", err.response?.data);
    throw err
  }
}

module.exports = {
  fetchChatResponse,
  getModels
}