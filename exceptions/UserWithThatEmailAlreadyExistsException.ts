import HttpException from "./HttpExceptions";

class UserWithThatEmailAlreadyExistsException extends HttpException {
  constructor(email: String) {
    super(500, `User ${email} Already Exist `);
  }
}

export default UserWithThatEmailAlreadyExistsException;
