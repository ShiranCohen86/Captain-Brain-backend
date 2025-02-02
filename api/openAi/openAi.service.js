const axios = require('axios');
const httpService = require('../../services/httpService');

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

async function askAiQuestion(userMessage, messagesLog) {
	try {
		messagesLog.push({
			"role": "system",
			"content": "You are an AI that provides clear, detailed, and well-organized answers. Use proper HTML structure with <h1>, <h2>, <p>, <ul>."
		}

		)
		const model = "gpt-4-turbo"
		const httpDataObj = {
			headers: API_HEADERS,
			data: {
				messages: messagesLog,
				model,
				max_tokens: 4096,
				temperature: 0.7,
				top_p: 1.0
			}

		}

		const askAiRes = await httpService.httpPost(`${API_URL}/chat/completions`, httpDataObj)

		const choices = askAiRes.data.choices

		// TO FIX For Loop choices
		const answer = choices[0].message.content
		const isSearchGoogle = answer.includes("don't have real-time") || answer.includes("provide real-time") || answer.includes("require an internet")
		if (isSearchGoogle) {

			const googleResults = await _searchGoogleCustomAPI(userMessage)
			//const messagesByGoogleResult = _setGoogleResultToMessagesFormat(googleResults)

			const messagesByGoogleResult = `Summarize the following search results:\n` +
				googleResults.map(result => `Title: ${result.title}\nSnippet: ${result.snippet}\nLink: ${result.link}`).join("\n\n");

			messagesLog.push({ role: "assistant", content: messagesByGoogleResult })

			const httpDataObj = {
				headers: API_HEADERS,
				data: {
					messages: messagesLog,
					model,
					max_tokens: 4096,
					temperature: 0.7,
					top_p: 1.0
				}

			}

			const askAiResWithGoogle = await httpService.httpPost(`${API_URL}/chat/completions`, httpDataObj)
			console.log(askAiResWithGoogle.data.choices[0].message.content);

			return askAiResWithGoogle.data.choices[0].message.content

		}
		//const isAdded = await _addAnswerToDb(answer)
		return answer

	} catch (err) {
		console.log(err.response.data.error)
		throw err
	}
}
function getMessagesByUserId() {
	return ""
}
const _addAnswerToDb = (answer) => {
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

