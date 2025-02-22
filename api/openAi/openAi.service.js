const axios = require('axios');
const httpService = require('../../services/httpService');
const asyncLocalStorage = require('../../services/als.service');
const logger = require('../../services/logger.service')
const userService = require("../user/user.service");
const { Timestamp } = require('mongodb');

const API_URL = 'https://api.openai.com/v1';
const API_HEADERS = {
	Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`,
	'Content-Type': 'application/json',
}

module.exports = {
	askAiQuestion,
	getAvailableModels,
	getRoleByMessage,
	getMessagesByUserId
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

async function askAiQuestion(userMessage, user, sessionConversation) {
	try {
		const messages = await _buildMessagesToAi(userMessage, user, sessionConversation?.messages)
		const systemConfigFirst = {
			"role": "system",
			"content": "the answer from you set in proper HTML structure with <h1>, <h2>, <p>, <ul>. if require access real data or you need access to internet or you do not have information return in capital 'NO INTERNET' only. You are a highly adaptable assistant who tailors your responses based on the tone and nature of the user’s questions. Your responses should align with the mood and content of the query, ensuring they feel appropriate and engaging. For serious questions, provide informative and thoughtful responses. For humorous questions, use humor and wit."
		}

		const firstMessagesToAi = messages.concat([systemConfigFirst])

		const model = _getBestGPTModelResponse(userMessage)
		const httpDataObj = {
			headers: API_HEADERS,
			data: {
				messages: firstMessagesToAi,
				model,
				max_tokens: 4096,
				temperature: 0.7,
				top_p: 1.0
			}

		}

		const askAiRes = await httpService.httpPost(`${API_URL}/chat/completions`, httpDataObj)
		const choices = askAiRes.data.choices
		// TO FIX For Loop choices
		let answer = choices[0].message.content
		//if (answer.toLowerCase().includes("no internet")) {
		let answerToResponse = {}
		if (answer.toLowerCase().includes("no internet")) {
			console.log("google");

			const googleResults = await _searchGoogleCustomAPI(userMessage)
			console.log(1);
			//const messagesByGoogleResult = _setGoogleResultToMessagesFormat(googleResults)

			const summarizeGoogleResult = `Summarize the following search results:\n` +
				googleResults.map(result => `Title: ${result.title}\nSnippet: ${result.snippet}\nLink: ${result.link}`).join("\n\n");

			const messagesByGoogle = {
				role: "assistant",
				content: summarizeGoogleResult
			}
			messages.push(messagesByGoogle)
			console.log(2);

			const systemConfigFirst = {
				"role": "system",
				"content": "the answer from you set in proper HTML structure with <h1>, <h2>, <p>, <ul>.You are a highly adaptable assistant who tailors your responses based on the tone and nature of the user’s questions. Your responses should align with the mood and content of the query, ensuring they feel appropriate and engaging. For serious questions, provide informative and thoughtful responses. For humorous questions, use humor and wit."
			}
			messages.push(systemConfigFirst)

			console.log(3);
			const httpDataObj = {
				headers: API_HEADERS,
				data: {
					messages: messages,
					model,
					max_tokens: 4096,
					temperature: 0.7,
					top_p: 1.0
				}

			}

			const askAiResWithGoogle = await httpService.httpPost(`${API_URL}/chat/completions`, httpDataObj)
			answer = askAiResWithGoogle.data.choices[0].message.content

		}

		let conversionId = ""

		if (user?._id) {
			const messagesToSave = [{
				createdAt: "Timestamp",
				role: "user",
				content: userMessage
			},
			{
				createdAt: "Timestamp",
				role: "system",
				content: answer
			}]

			if (sessionConversation?._id) {

				userService.addAnswerToConversation(messagesToSave, user._id, sessionConversation._id)

			} else {
				const resObj = await userService.addConversation(messagesToSave, user._id)
				conversionId = resObj.conversationId
			}

		}
		return { success: true, answer, conversionId }

	} catch (err) {
		logger.error('Failed to askAiQuestion ' + err)
		throw err
	}
}

function getMessagesByUserId() {
	return ""
}

function getRoleByMessage(message) {
	// Normalize the message to lowercase for easier pattern matching
	const normalizedMessage = message.trim().toLowerCase();

	// Keywords or patterns to help decide the role

	// Keywords for function-related messages (API, external calls, etc.)
	const functionKeywords = [
		'call', 'query', 'fetch', 'request', 'api', 'fetch data', 'make a request', 'retrieve', 'get', 'send', 'call endpoint',
		'submit', 'invoke', 'execute', 'invoke function', 'connect', 'retrieve information', 'get data', 'access',
		'trigger', 'process request', 'קריאה', 'שאל', 'שלח בקשה', 'שמור', 'שלח', 'שלוף', 'בקשה', 'שחזור', 'קבל', 'שלוף מידע', 'שלח בקשה',
		'הפעל', 'בצע', 'חבר', 'שלוף נתונים', 'פנה', 'הזמן', 'בצע בקשה'
	];

	// Keywords for tool-related messages (using specific tools or utilities)
	const toolKeywords = [
		'calculate', 'tool', 'process', 'analyze', 'compute', 'evaluate', 'measure', 'estimate', 'convert', 'run',
		'parse', 'format', 'transform', 'debug', 'check', 'validate', 'test', 'verify', 'filter', 'render',
		'build', 'compile', 'simulate', 'generate', 'חישוב', 'כלי', 'עיבוד', 'ניתוח', 'חישוב', 'הערכה', 'המרה', 'הרץ', 'פענח', 'עיצוב', 'בדוק',
		'וולידציה', 'הפק', 'הרכבה', 'קומפילציה', 'סימולציה', 'ייצור'
	];

	// Keywords for system-related messages (setting context, configuring, instructions)
	const systemKeywords = [
		'setup', 'instructions', 'context', 'configure', 'rule', 'define', 'behavior', 'directive', 'background',
		'parameters', 'environment', 'setup instructions', 'guide', 'preset', 'directive', 'mode', 'settings',
		'behavior model', 'user settings', 'set rules', 'initialize', 'configure assistant', 'contextualize', 'הגדרה', 'הוראות', 'הקשר', 'הגדרה', 'הוראות', 'תצורה', 'מערכת', 'הגדר', 'סביבה', 'הגדרות',
		'הגדרת התנהגות', 'הוראות קודמות', 'הדרכה', 'פרמטרים', 'הקשר של המערכת', 'הגדר דפוסים', 'הגדרת כללים'
	];

	// Keywords for developer-related messages (debugging, logs, error handling, configuration)
	const developerKeywords = [
		'debug', 'log', 'error', 'admin', 'configuration', 'monitor', 'trace', 'developer', 'traceback', 'exception',
		'output', 'debugging', 'test', 'setup', 'administer', 'server', 'deploy', 'build', 'manage', 'error message',
		'report issue', 'debugger', 'config', 'error handling', 'log message', 'trace logs', 'check logs', 'תיקון', 'יומן', 'שגיאה', 'מנהל', 'הגדרות', 'ניטור', 'עקוב', 'מתכנת', 'יומן שגיאות', 'חריגה',
		'פלט', 'טעינה', 'בדיקה', 'מנהל המערכת', 'תצורה', 'שלח שגיאה', 'שלח מידע', 'בדוק יומנים'
	];

	// Keywords for assistant-related messages (model-generated responses)
	const assistantKeywords = [
		'i think', 'according to my knowledge', 'as per my understanding', 'based on my analysis', 'the answer is',
		'it seems', 'i believe', 'let me explain', 'here is the response', 'in my opinion', 'it appears', 'based on',
		'i have found', 'to summarize', 'here is what i know', 'this is the solution', 'as i understand', 'my conclusion', 'אני חושב', 'לפי הידע שלי', 'לפי ההבנה שלי', 'על פי הערכתי', 'התשובה היא', 'זה נראה',
		'אני מאמין', 'תן לי להסביר', 'ככה אני רואה את זה', 'זהו הפתרון', 'לפי מה שאני מבין', 'המסקנה שלי',
		'תשובתי היא', 'תשובה נכונה'
	];

	// Check if the message matches any developer-level commands
	if (developerKeywords.some(keyword => normalizedMessage.includes(keyword))) {
		return 'developer';
	}

	// Check if the message is related to system context or instructions
	if (systemKeywords.some(keyword => normalizedMessage.includes(keyword))) {
		return 'system';
	}

	// Check if the message seems like it's calling a function (API, external service, etc.)
	if (functionKeywords.some(keyword => normalizedMessage.includes(keyword))) {
		return 'function';
	}

	// Check if the message refers to using a specific tool
	if (toolKeywords.some(keyword => normalizedMessage.includes(keyword))) {
		return 'tool';
	}

	// Check if the message seems to be an assistant-generated response
	if (assistantKeywords.some(keyword => normalizedMessage.includes(keyword))) {
		return 'assistant';
	}

	// Otherwise, assume it's a user message
	return 'user';

};

function _setGoogleResultToMessagesFormat(googleResults) {
	return googleResults.map((result) => {
		return {
			role: "system",
			content: result.snippet
		}
	})
}

// Function to search using Google Custom Search API
async function _searchGoogleCustomAPI(query) {
	const url = 'https://www.googleapis.com/customsearch/v1';

	try {
		// Send the GET request to the Custom Search API
		const response = await axios.get(url, {
			params: {
				key: `${process.env.GOOGLE_API_KEY}`,  // Your API key
				cx: `${process.env.CHATGPT_CX}`,       // Your Custom Search Engine ID
				q: query,     // Search query
			},
		});

		// Handle and display the search results
		//console.log(response.data.items);  // The search results
		return response.data.items
	} catch (error) {
		console.error("Error fetching data from Google Custom Search API:", error);
	}
}

function _getBestGPTModelResponse(question) {
	const questionLength = question.length;

	let model = '';
	if (questionLength < 25) {
		model = 'gpt-3.5-turbo';
	} else if (questionLength < 50) {
		model = 'gpt-4-turbo';
	} else {
		model = 'gpt-4';
	}
	return model;
}

async function _buildMessagesToAi(userMessage, user = {}, sessionConversation = []) {
	try {
		let messagesToReturn = []
		if (Object.keys(user).length) {
			const hisMessages = await userService.getMessagesByUserId(user._id)


			//messagesToReturn.push(hisMessages)
		} else {
			if (sessionConversation.length) {
				messagesToReturn = messagesToReturn.concat(sessionConversation)
			}
		}

		const role = getRoleByMessage(userMessage)
		messagesToReturn.push({
			role,
			content: userMessage
		})


		return messagesToReturn

	} catch (err) {
		logger.error('Failed to _buildMessagesToAi ' + err)
		throw err
	}


}