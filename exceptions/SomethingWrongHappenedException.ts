import HttpException from "./HttpExceptions";

class SomethingWrongHappenedException extends HttpException {
  constructor(
    e: string = `Something wrong happened see server logs for more informations`
  ) {
    super(500, e);
  }
}

export default SomethingWrongHappenedException;
