const chatgptService = require('../../services/chatgpt.service');

module.exports = {
	askQuestion,
	getModels

};

function askQuestion(messages) {
	return chatgptService.fetchChatResponse(messages)
}

function getModels(){
	return chatgptService.getModels()
}