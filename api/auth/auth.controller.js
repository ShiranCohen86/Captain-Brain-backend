const authService = require('./auth.service')
const userService = require('../user/user.service')
const logger = require('../../services/logger.service')

module.exports = {
    login,
    signup,
    logout
}

async function login(req, res) {
    try {
        let { phone, password } = req.body
        let resObj = {}
        console.log("login", req.session);

        if (req.session?.user?.phone) {
            phone = req.session.user.phone
            resObj = await userService.getByUsername(phone);
        }
        if (!Object.keys(resObj).length) {
            resObj = await authService.login(phone, password)
        }
        if (!resObj.success) return res.status(401).send(resObj.message)

        req.session.user = resObj.user
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

