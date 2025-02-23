const bcrypt = require("bcrypt");
const userService = require("../user/user.service");
const logger = require("../../services/logger.service");

module.exports = {
  signup,
  login,
};

async function login(phone, password, token) {
  try {
    let resObj = {}
    if (token) {
      resObj = await userService.getUserByToken(token)
    }
    if (!Object.keys(resObj).length) {
      resObj = await userService.getUserByUsername(phone);
      const match = await bcrypt.compare(password, resObj.user.password);
      if (!match) return { success: false, message: "incorrect password" }
    }
    if (!resObj.success) return { success: resObj.success, message: resObj.message }

    logger.debug(`auth.service - login with phone: ${phone}`);
    const tokenToCookie = resObj.user.token
    delete resObj.user.password;
    delete resObj.user.token;
    console.log(2222, resObj.user);

    return { success: true, user: resObj.user, token: tokenToCookie };
  } catch (err) {
    console.log(err);

    logger.error('auth.service - login -', err)
    throw err
  }

}

async function signup(user) {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(user.password, saltRounds);
    user.password = hash;
    const resObj = await userService.add(user);
    if (!resObj.success) return { success: resObj.success, message: resObj.message }

    const token = resObj.user.token
    delete resObj.user.password;
    delete resObj.user.token
    logger.debug(`auth.service - signup with phone: ${user.phone}, fullname: ${user.name}`);

    return { success: true, user: resObj.user, token }
  } catch (err) {
    logger.error('auth.service - signup -', err)
    throw err
  }
}


