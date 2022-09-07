import * as express from "express";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import authMiddleware from "../../middleware/auth.middleware";
import NotFoundException from "../../exceptions/NotFoundException";

class PrintKeys extends BaseController {
  public read = "/PrintKeys/";
  public get = "/PrintKeys/:DocType";

  public io;
  public router = express.Router();
  public PrintKeys: any; //new Branches();
  public DOCTYPE = ["DT-1"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
        try {
          this.getPrintkeysById(req, res, next)
  
        } catch (error) {
          console.log(error);
          next(
            new HttpException(
              error.originalError.status || 400,
              error.originalError.message
            )
          );
        }
      });
    this.router.get(this.read, authMiddleware, async (req, res, next) => {
      try {
        this.getAllPrintKeys(req, res, next)

      } catch (error) {
        console.log(error);
        next(
          new HttpException(
            error.originalError.status || 400,
            error.originalError.message
          )
        );
      }
    });

  }

  private getPrintkeysById = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {

    let { DocType } = request.params;
    const { PrintKeys } = request.db.models;

    let PrintKeysResult = await PrintKeys.findAll({
      where: { Doctype: DocType },
      // attributes: ["Series", "BranchName", "isGroup", "ParentBranch"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.message || "Some error occurred while find one  PrintKeys."
      })
    });

    if (PrintKeysResult.length==0) {
      next(new NotFoundException(DocType, "PrintKeys"));
      return;
    }

console.log("User (action)  : get By DocType [PrintKeys] By : {"+request.userName+"}    Date:"+Date());

    response.send(PrintKeysResult);
  };

  getAllPrintKeys = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { PrintKeys } = request.db.models;

    try {
await PrintKeys.findAll({
    where: { ...filters },
    offset: parseInt(page) * parseInt(pageSize),
    limit: parseInt(pageSize),
  }).then(data => {
    if (data.length == 0) {     
      console.log({ message: " there is no data ... in tbl PrintKeys" });
      response.send(data);
    }
    else {
      console.log("User (action)  : getAll [PrintKeys] By : {"+request.userName+"}    Date:"+Date() );
      data = data.map((x) => {
        return {
          Doctype: x.Doctype,
          PrintKeys: [x.PrintKey, x.Arabic, x.Turkish, x.Kurdish].filter(
            (x) => !!x
          ),
          Replacement: x.ReplacementObject,
        };
      });
      return response.send(data);
    }
  })

} catch (error) {
  console.log(error)
  response.send(error)
}

  }



}

export default PrintKeys;
