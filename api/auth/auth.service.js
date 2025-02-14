const bcrypt = require("bcrypt");
const userService = require("../user/user.service");
const logger = require("../../services/logger.service");

async function login(username, password) {
  logger.debug(`auth.service - login with username: ${username}`);
  const user = await userService.getByUsername(username);
  if (!user) return Promise.reject("Invalid username");
  const match = await bcrypt.compare(password, user.password);
  if (!match) return Promise.reject("Invalid password");

  delete user.password;
  return user;
}

async function signup(user) {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(user.password, saltRounds);
    user.password = hash;
    const isAdd = await userService.add(user);
    if (!isAdd) return

    logger.debug(`auth.service - signup with username: ${user.phone}, fullname: ${user.email}`);
    

    return true

  } catch (error) {
    throw error
  }
}

module.exports = {
  signup,
  login,
};
