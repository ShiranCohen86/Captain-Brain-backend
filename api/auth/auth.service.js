const bcrypt = require("bcrypt");
const userService = require("../user/user.service");
const logger = require("../../services/logger.service");

module.exports = {
  signup,
  login,
};

async function login(phone, password) {
  try {
    const resObj = await userService.getByUsername(phone);
    if (!resObj.success) return { success: resObj.success, message: resObj.message }

    const user = resObj.user
    const match = await bcrypt.compare(password, user.password);
    if (!match) return { success: false, message: "incorrect password" }

    logger.debug(`auth.service - login with phone: ${phone}`);
    delete user.password;
    return { success: true, user };
  } catch (error) {
    throw error
  }

}

async function signup(user) {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(user.password, saltRounds);
    user.password = hash;
    const isAdd = await userService.add(user);
    if (!isAdd.success) return { success: isAdd.success, message: isAdd.message }

    logger.debug(`auth.service - signup with phone: ${user.phone}, fullname: ${user.name}`);
    delete user.password;
    return { success: true, user }
  } catch (error) {
    throw error
  }
}


