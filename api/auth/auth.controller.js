const authService = require('./auth.service')
const userService = require('../user/user.service')
const logger = require('../../services/logger.service')
const axios = require('axios');


module.exports = {
    login,
    signup,
    logout,
    getSrc
}

async function getSrc(req, res) {
    try {
        const { lat, lng } = req.body
        console.log("lat",lat);
console.log("lng",lng);

        const test = await axios.get(`https://www.google.com/maps/embed/v1/view?key=${process.env.GOOGLE_MAP_KEY}&center=${lat},${lng}&zoom=15`);
console.log("test",test);
        res.json(test.data)
    } catch (err) {
        logger.error('Failed to Login ' + err)
        console.log(err);
res.status(500).send(err)
    }
}

async function login(req, res) {
    try {
        const { phone, password, token } = req.body

        const tokenFromFront = token.length && token[0].token
        if (!tokenFromFront && !phone && !password) return res.status(401).send("no credential data")

        let resObj = ""
        resObj = await userService.getByToken(tokenFromFront)
        if (!resObj.success) {
            resObj = await authService.login(phone, password)
        }
        if (!resObj.success) return res.status(401).send(resObj.message)

        req.session.user = resObj.user
        const tokenToSend = resObj.user.phone
        res.cookie('token', tokenToSend)
        const userToUpdate = resObj.user
        userToUpdate.token = tokenToSend
        userService.update(userToUpdate)

        res.json(resObj.user)
    } catch (err) {
        logger.error('Failed to Login ' + err)
        res.status(500).send(err)
    }
}

async function signup(req, res) {
    try {
        const newUser = req.body
        const passForLogin = newUser.password
        const resObj = await authService.signup(newUser)
        if (!resObj.success) return res.status(401).send(resObj.message)

        req.session.user = newUser
        const tokenToSend = resObj.user.phone
        res.cookie('token', tokenToSend)
        res.json(resObj.user)
        /*
        logger.debug(`auth.route - new account created: ` + JSON.stringify(account))
        */
    } catch (err) {
        logger.error('Failed to signup ' + err)
        res.status(500).send(err)
    }
}

async function logout(req, res) {
    try {
        req.session.destroy()
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(500).send({ err: 'Failed to logout' })
    }
}

