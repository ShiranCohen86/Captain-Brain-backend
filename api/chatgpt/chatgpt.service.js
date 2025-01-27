const httpService = require('../../services/httpService');

const API_URL = 'https://api.openai.com/v1';
const API_HEADERS = {
	Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`,
	'Content-Type': 'application/json',
}

module.exports = {
	askAiQuestion,
	getAvailableModels
};

async function getAvailableModels() {
	try {
		const httpDataObj = {
			headers: API_HEADERS,
		}
		const modelsRes = await httpService.httpGet(`${API_URL}/models`, httpDataObj)
		const models = modelsRes.data.data

		return models.map((model) => {
			return {
				name: model.id,
				createdDate: model.created
			}
		})
	} catch (err) {
		throw err
	}
}

async function askAiQuestion(messages, selectedModel) {
	try {
		const httpDataObj = {
			headers: API_HEADERS,
			data: {

				messages,
				model: selectedModel,
				max_tokens: 200,
			}

		}
		const askAiRes = await httpService.httpPost(`${API_URL}/chat/completions`, httpDataObj)
		const choices = askAiRes.data.choices
		// TO FIX For Loop choices
		return choices[0].message.content

	} catch (err) {
		throw err
	}

}

function getModels() {
	return httpService.getModels()
}