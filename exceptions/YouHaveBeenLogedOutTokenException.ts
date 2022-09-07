import HttpException from "./HttpExceptions";

class YouHaveBeenLogedOutTokenException extends HttpException {
  constructor() {
    super(403, `You Have Been Loged OutToken Exception`);
  }
}

export default YouHaveBeenLogedOutTokenException;