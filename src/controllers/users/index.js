import bcrypt from "bcrypt";

import User from "../../models/users/index.js";

import { generateToken } from "../../helpers/auth/auth.js";
import config from "../../config/index.js";

async function login(req, res) {
  try {
    const { userId } = req.params;
    const { password } = req.body;

    //Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ errorCode: "USER_NOT_FOUND" });
    }

    //Check if the password is correct
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ errorCode: "INVALID_USER_CREDENTIALS" });
    }

    //Generate access token
    const payload = { userId };
    const accessToken = await generateToken(
      payload,
      "48H",
      config.jwtSecret,
      "access_token"
    );
    const refreshToken = await generateToken(
      payload,
      "48H",
      config.jwtSecret,
      "refresh_token"
    );

    let cookieOptions = {};
    cookieOptions = {
      httpOnly: true,
      secure: false,
      Path: "/",
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(201).json({ id: userId });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ errorCode: "SERVER_ERROR", errorMessage: "Server Error" });
  }
}

export { login };
