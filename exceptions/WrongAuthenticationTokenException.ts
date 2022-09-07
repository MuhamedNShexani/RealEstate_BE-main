import HttpException from "./HttpExceptions";

class WrongAuthenticationTokenException extends HttpException {
  constructor() {
    super(401, `Token Error`);
  }
}

export default WrongAuthenticationTokenException;
