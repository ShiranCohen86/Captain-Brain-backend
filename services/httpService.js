const Axios = require('axios');
const asyncLocalStorage = require('./als.service');

const axios = Axios.create({
    withCredentials: true
})

function httpGet(url, data) {
    return ajax(url, 'GET', data)
}

function httpPost(url, data) {
    return ajax(url, 'POST', data)
}

function httpPut(url, data) {
    return ajax(url, 'PUT', data)
}

function httpDelete(url, data) {
    return ajax(url, 'DELETE', data)
}

async function ajax(url, method = 'GET', { headers, data }) {
    try {
        const alsStore = asyncLocalStorage.getStore()

        const axiosOptions = {
            url,
            method,
            headers,
            data
        }

        //console.log({axiosOptions});
        return await axios(axiosOptions)
    } catch (err) {
        console.log(`Had Issues ${method}ing to the backend, url: ${url},`)// with data: ${data}`)

        if (err.response && err.response.status === 401) {

        }
        throw err
    }
}

module.exports = {
    httpGet,
    httpPost,
    httpPut,
    httpDelete
}
