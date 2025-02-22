
const asyncLocalStorage = require('../../services/als.service');
const dbService = require('../../services/db.service')
const utilService = require('../../services/utilService')
const logger = require('../../services/logger.service')
const authService = require('../auth/auth.service')

const { ObjectId } = require("mongodb");

module.exports = {
    query,
    getById,
    getUserByUsername,
    remove,
    update,
    add,
    getUserByToken,
    addConversation,
    getUser,
    getMessagesByUserId,
    addAnswerToConversation
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
async function getUserByUsername(phone) {
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

async function getUserByToken(token) {
    try {
        if (!token) return { success: false, message: "no token value" }
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ token })
        if (!user) return { success: false, message: "no exist user" }
        return { success: true, user }
    } catch (err) {
        logger.error(`while finding phone ${token}`, err)
        throw err
    }
}
async function getUserById(userId) {
    try {
        if (!userId) return { success: false, message: "no userId value" }
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ "_id": userId })
        if (!user) return { success: false, message: "no exist user" }
        return { success: true, user }
    } catch (err) {
        logger.error(`while finding id ${userId}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection('user')
        collection.deleteOne({ '_id': ObjectId(userId) })
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        const collection = await dbService.getCollection('user')
        collection.updateOne({ '_id': user._id }, { $set: user })

    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function add(user) {
    try {
        const collection = await dbService.getCollection('user')
        const dbUser = await collection.findOne({ phone: user.phone })
        if (dbUser) return { success: false, message: "phone exist" }

        const userToAdd = {
            name: user.name,
            password: user.password,
            phone: user.phone,
            token: user.phone,
            conversation: []
        }

        const res = await collection.insertOne(userToAdd)
        const userId = res.insertedId
        userToAdd.user_id = userId
        return { success: true, user: userToAdd }
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


async function addConversation(conversation, userId) {
    try {
        const collection = await dbService.getCollection('user')
        console.log(2);

        const conversationId = utilService.makeId()
        console.log(3, conversationId);
        const conversationToAdd = {
            _id: conversationId,
            messages: conversation,
            createdAt: "timestamp"
        }

        console.log(4, conversationToAdd);
        const _id = new ObjectId(userId);

        const isUpdate = await collection.updateOne({ _id }, { $push: { conversations: conversationToAdd } })
        console.log(5, isUpdate);



        return { success: true, conversationId };
    } catch (err) {
        logger.error(`cannot addConversation ${userId}`, err)
        throw err
    }
}
async function addAnswerToConversation(messages, userId, conversationId) {

    try {
        const _id = new ObjectId(userId);
        const collection = await dbService.getCollection('user')
        const isUpdate = await collection.updateOne(
            { _id, "conversations._id": conversationId },
            { $push: { "conversations.$.messages": { $each: messages } } }
        )

        return true;
    } catch (err) {
        logger.error(`cannot addAnswerToConversation ${userId}`, err)
        throw err
    }
}
async function getUser(phone, password, token) {
    try {
        let userObj = ""
        userObj = await getUserByToken(tokenFromFront)
        if (!userObj.success) {
            userObj = await authService.login(phone, password)
        }

        return true;
    } catch (err) {
        logger.error(`cannot update user ${userId}`, err)
        throw err
    }
}
async function getMessagesByUserId(userId) {
    try {
        const resObj = await getUserById(userId)

        if (!resObj.success) {
        }

        return resObj?.user?.conversation;
    } catch (err) {
        logger.error(`cannot update user ${userId}`, err)
        throw err
    }
}
