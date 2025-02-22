const MongoClient = require('mongodb').MongoClient
const logger = require("../services/logger.service");
const config = require('../config')

module.exports = {
    getCollection
}

const dbName = 'CaptainBrainDB'
const client = new MongoClient(config.dbURL);

async function getCollection(collectionName) {
    try {
        await client.connect();
        const database = client.db(dbName)
        return database.collection(collectionName);
    } catch (err) {
        logger.error('Failed to get Mongo collection', err)
        throw err
    }
}





