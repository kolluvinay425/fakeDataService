import { validationResult } from "express-validator";

const validateRequest = (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({ errorCode: "MISSING_REQUIRED_FIELD" });
  }

  next();
};

const languageValidation = async (value) => {
  const languages = ["en", "it", "fr"];

  if (!languages.includes(value)) {
    return res.status(400).json({ errorCode: "MISSING_REQUIRED_FIELD" });
  }
  return true;
};
export { validateRequest, languageValidation };
