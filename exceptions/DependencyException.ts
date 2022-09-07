import HttpException from "./HttpExceptions";

class DependencyException extends HttpException {
  constructor(msg) {
    super(422, msg);
  }
}

export default DependencyException;
