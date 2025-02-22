const authService = require('./auth.service')
const logger = require('../../services/logger.service')

module.exports = {
    login,
    signup,
    logout,
}

async function login(req, res) {
    try {
        const { phone, password, token } = req.body
        const tokenFromFront = token[0]?.token
        if (!tokenFromFront && !phone && !password) return res.status(401).send("no credential data")

        const resObj = await authService.login(phone, password, tokenFromFront)
        if (!resObj.success) return res.status(401).send(resObj.message)

        req.session.user = resObj.user

        res.cookie('token', resObj.token)
        res.json(resObj.user)
    } catch (err) {
        logger.error('auth.controller - login -', err)
        res.status(500).send(err)
    }
}

async function signup(req, res) {
    try {
        const newUser = req.body
        if (!Object.keys(newUser).length) return res.status(401).send("no user data")

        const resObj = await authService.signup(newUser)
        if (!resObj.success) return res.status(401).send(resObj.message)

        req.session.user = newUser
        res.cookie('token', resObj.token)
        logger.debug(`auth.route - new account created: ` + JSON.stringify(newUser.user))
        res.json(resObj.user)

    } catch (err) {
        logger.error('auth.controller - signup -', err)
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

