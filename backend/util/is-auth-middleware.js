const jwt = require("jsonwebtoken");
const errorHandler = require("./error-helper");

//666197096b6c1011fe0a1868 osama
//6661974ddc392eee807203d8 ahmed
module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw errorHandler.createError("Not authenticated", 401)
  }

  let decoded;
  try {
    const token = req.get("Authorization").split(" ")[1];
    decoded = jwt.verify(token, process.env.JWT_KEY);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decoded){
    throw errorHandler.createError("Not authenticated", 401)
  }

  req.userId = decoded.userId
  // req.userId = "66706bb9cf8a98b09f7e9add"
  next();
};