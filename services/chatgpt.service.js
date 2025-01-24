const logger = require('./logger.service');
const Axios = require('axios');

const API_URL = 'https://api.openai.com/v1/chat/completions';

async function fetchChatResponse(data) {
  try {
    console.log("process.env.CHATGPT_API_KEY", process.env.CHATGPT_API_KEY);

    return await Axios.post(
      API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: data,
        max_tokens: 150,
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


module.exports = {
  fetchChatResponse
}