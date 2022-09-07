import HttpException from "./HttpExceptions";

class AddingRowException extends HttpException {
    constructor(err: any, tbName: string ) {
        super(400,  err.message||"ERROR: Some error occurred while [creating or updating] the"+ tbName );
      }
}

export default AddingRowException;
