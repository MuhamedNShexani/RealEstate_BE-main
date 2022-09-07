import HttpException from "./HttpExceptions";

class WrongCredentialsException extends HttpException {
  constructor() {
    super(403, `Wrong username or password`);
  }
}

export default WrongCredentialsException;
