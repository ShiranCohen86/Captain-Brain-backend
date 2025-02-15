const authService = require('./auth.service')
const logger = require('../../services/logger.service')

module.exports = {
    login,
    signup,
    logout
}

async function login(req, res) {
    const { phone, password } = req.body

    try {
        const user = await authService.login(phone, password)

        req.session.user = user
        res.json(user)
    } catch (err) {
        logger.error('Failed to Login ' + err)
        res.status(401).send({ err: 'Failed to Login' })
    }
}

async function signup(req, res) {
    try {
        const newUser = req.body
        console.log({ newUser });


        const passForLogin = newUser.password
        const isSignup = await authService.signup(newUser)
        if (!isSignup.success) return res.status(401).send(isSignup.message)

        req.session.user = newUser
        res.json(newUser)
        /*
        logger.debug(`auth.route - new account created: ` + JSON.stringify(account))
        const user = await authService.login(newUser.username, passForLogin)
        res.json(user)
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

