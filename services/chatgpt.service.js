const logger = require('./logger.service');
const Axios = require('axios');

const API_URL = 'https://api.openai.com/v1/chat/completions';

async function fetchChatResponse(data) {
  try {
    return await Axios.post(
      API_URL,
      {
        model: 'gpt-4',
        messages: data,
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


module.exports = {
  fetchChatResponse
}