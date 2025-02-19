
const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')

const ObjectId = require('mongodb').ObjectId

module.exports = {
    query,
    getById,
    getByUsername,
    remove,
    update,
    add,
    getByToken
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('user')
        var users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            user.createdAt = ObjectId(user._id).getTimestamp()
            // Returning fake fresh data
            // user.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ '_id': ObjectId(userId) })
        delete user.password

        user.givenReviews = await reviewService.query({ byUserId: ObjectId(user._id) })
        user.givenReviews = user.givenReviews.map(review => {
            delete review.byUser
            return review
        })

        return user
    } catch (err) {
        logger.error(`while finding user ${userId}`, err)
        throw err
    }
}
async function getByUsername(phone) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ phone })
        if (!user) return { success: false, message: "no exist user" }
        return { success: true, user }
    } catch (err) {
        logger.error(`while finding phone ${phone}`, err)
        throw err
    }
}
async function getByToken(token) {
    try {
        if (!token) return { success: false, message: "no token value" }
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ token })
        if (!user) return { success: false, message: "no exist user" }
        return { success: true, user }
    } catch (err) {
        logger.error(`while finding phone ${phone}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection('user')
        await collection.deleteOne({ '_id': ObjectId(userId) })
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        const collection = await dbService.getCollection('user')
        collection.updateOne({ '_id': user._id }, { $set: user })

        return user;
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function add(user) {
    try {
        // peek only updatable fields!
        // const userToAdd = {
        //     username: user.username,
        //     password: user.password,
        //     fullname: user.fullname,
        // }
        const collection = await dbService.getCollection('user')
        const dbUser = await collection.findOne({ phone: user.phone })
        if (dbUser) return { success: false, message: "phone exist" }
        user.token = user.phone
        await collection.insertOne(user)
        return { success: true }
    } catch (err) {
        logger.error('cannot insert user', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            {
                username: txtCriteria
            },
            {
                fullname: txtCriteria
            }
        ]
    }
    if (filterBy.minBalance) {
        criteria.balance = { $gte: filterBy.minBalance }
    }
    return criteria
}


