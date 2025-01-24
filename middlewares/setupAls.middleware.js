const logger = require('../services/logger.service')
const asyncLocalStorage = require('../services/als.service')

async function setupAsyncLocalStorage(req, res, next) {
  const storage = {}
  asyncLocalStorage.run(storage, () => {
    if (req.session?.access_token) {
      const alsStore = asyncLocalStorage.getStore()
      alsStore.spotifyToken = req.session.access_token
    }
    next()
  })
}

module.exports = setupAsyncLocalStorage

