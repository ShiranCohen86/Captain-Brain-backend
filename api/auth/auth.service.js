const bcrypt = require("bcrypt");
const userService = require("../user/user.service");
const logger = require("../../services/logger.service");

module.exports = {
  signup,
  login,
};

async function login(phone, password) {
  logger.debug(`auth.service - login with phone: ${phone}`);
  const user = await userService.getByUsername(phone);
  if (!user) return Promise.reject("Invalid phone");
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
    if (!isAdd.success) return { success: isAdd.success, message: isAdd.message }
    logger.debug(`auth.service - signup with username: ${user.phone}, fullname: ${user.name}`);
    return { success: true }

  } catch (error) {
    throw error
  }
}


