const jwt = require("jsonwebtoken");
const {User} = require("../models/UserModel");

const validateToken = async (req, res, next) => {
  try {
    const { refreshToken, token } = req.cookies;
    if (!refreshToken || !token) {
      const error = {
        status: 401,
        message: "Unauthorized",
      };

      return next(error);
    }
    0;
    let _id;

    try {
      _id = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)._id;
      _id = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)._id;
    } catch (error) {
      return next(error);
    }

    let user;

    try {
      user = await User.findOne({ _id: _id });
    } catch (error) {
      return next(error);
    }

    req.user = user;

    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = validateToken;
