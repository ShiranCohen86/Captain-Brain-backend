const chatgptService = require('../../services/chatgpt.service');

module.exports = {
	askQuestion

};

function askQuestion(messages) {
	return chatgptService.fetchChatResponse(messages)
}

