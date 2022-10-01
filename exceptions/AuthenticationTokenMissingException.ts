import HttpException from "./HttpExceptions";

class AuthenticationTokenMissingException extends HttpException {
  constructor() {
    super(401, `Token Does not exist`);
  }
}

export default AuthenticationTokenMissingException;
