import { compose } from "compose-middleware";
import * as jwtWeb from "express-jwt";
import jwt from "jsonwebtoken";

import config from "../../config/index.js";

const { expressjwt } = jwtWeb;

const jwtMiddleware = expressjwt({
  secret: config.jwtSecret,
  algorithms: ["HS256"],
  userProperty: "user",
  getToken: (req) => req.cookies.accessToken,
});

const authMiddleware = compose(jwtMiddleware, (err, req, res, next) => {
  if (err) {
    if (err.inner.name === "TokenExpiredError") {
      return res.status(401).json({ errorCode: "TOKEN_EXPIRED" });
    }
    res.status(401).json({ errorCode: "TOKEN_NOT_VALID" });
    return;
  }
  next(err);
});

function generateToken(userInfo, expTime, secret, subject) {
  const payload = {
    userInfo: userInfo,
    subject,
  };

  const options = {
    expiresIn: expTime,
  };

  const token = jwt.sign(payload, secret, options);
  return token;
}

export { authMiddleware, generateToken };
