const MongoClient = require('mongodb').MongoClient
const logger = require("../services/logger.service");


const config = require('../config')

module.exports = {
    getCollection
}

// Database Name
const dbName = 'CaptainBrainDB'
const client = new MongoClient(config.dbURL);


var dbConn = null

async function getCollection(collectionName) {
    try {
        await client.connect();
        const database = client.db(dbName)
        const collection = database.collection(collectionName);

        return collection
    } catch (err) {
        logger.error('Failed to get Mongo collection', err)
        throw err
    }
}





