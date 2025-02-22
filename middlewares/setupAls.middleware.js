const logger = require('../services/logger.service')
const asyncLocalStorage = require('../services/als.service')

async function setupAsyncLocalStorage(req, res, next) {
  const storage = {}
  asyncLocalStorage.run(storage, () => {
    if (req.sessionID) {
      const alsStore = asyncLocalStorage.getStore()
      alsStore.sessionId = req.sessionID
      console.log("is - ",req.session);

      if (res.session?.user) {
        alsStore.userId = req.session.user._id
        alsStore.isAdmin = req.session.user.isAdmin
      }
    }
    next()
  })
}

module.exports = setupAsyncLocalStorage

