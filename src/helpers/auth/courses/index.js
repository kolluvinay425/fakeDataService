export const checkCoursesAuth = async (req, res, next) => {
    try {
      const { method } = req;
      // Get the decoded JWT token from the request
      const decodedJwtToken = req.auth;
      const resource = "courses";

      const checkAdminAuth = decodedJwtToken.authorizations.includes(
        `${method.toLowerCase()}:${resource}:all`
      );
      const checkUserAuth = decodedJwtToken.authorizations.includes(
        `${method.toLowerCase()}:${resource}:own`
      );

  
      if (checkAdminAuth || checkUserAuth)  {
        next();
      } else {
        return res.status(401).json({ errorCode: "TOKEN_NOT_VALID" });
      }
    } catch (error) {
      
      return res.status(401).json({ errorCode: "TOKEN_EXPIRED" });
    }
  };
  