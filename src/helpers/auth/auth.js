import { compose } from "compose-middleware";
import * as jwtWeb from "express-jwt";

const { expressjwt } = jwtWeb;

const secret = process.env.JWT_SECRET;

const jwtMiddleware = expressjwt({
  secret: secret,
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

export { authMiddleware };
