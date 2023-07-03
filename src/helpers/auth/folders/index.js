import Directory from "../../../models/folders/index.js";
export const checkFoldersAuth = async (req, res, next) => {
  try {
    const { method } = req;
    // Get the decoded JWT token from the request
    const decodedJwtToken = req.auth;
    const resource = "directories";

    const checkAdminAuth = decodedJwtToken.authorizations.includes(
      `${method.toLowerCase()}:${resource}:all`
    );
    const checkUserAuth = decodedJwtToken.authorizations.includes(
      `${method.toLowerCase()}:${resource}:own`
    );

    if (checkAdminAuth || checkUserAuth) {
      const rootDirectory = await Directory.findOne({
        userId: decodedJwtToken.userId,
      });
      if (!rootDirectory) {
        return res.status(404).json({ errorCode: "ROOT_FOLDER_NOT_FOUND" });
      }
      decodedJwtToken.rootFolderId = rootDirectory._id;
      next();
    } else {
      return res.status(401).json({ errorCode: "TOKEN_NOT_VALID" });
    }
  } catch (error) {
    return res.status(401).json({ errorCode: "TOKEN_EXPIRED" });
  }
};
