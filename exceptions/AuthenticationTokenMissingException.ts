import HttpException from "./HttpExceptions";

class AuthenticationTokenMissingException extends HttpException {
  constructor() {
    super(403, `Token Does not exist`);
  }
}

export default AuthenticationTokenMissingException;
