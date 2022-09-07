import * as express from "express";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import authMiddleware from "../../middleware/auth.middleware";
import NotFoundException from "../../exceptions/NotFoundException";

class DocType extends BaseController {
  public read = "/DocTypes/";
  public get = "/DocTypes/:Series";

  public io;
  public router = express.Router();
  public DocType: any; //new Branches();

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getDocTypesBySeries(req, res, next)

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
        this.getAllDocTypes(req, res, next)

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

  private getDocTypesBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {

    let { Series } = request.params;
    const { DocTypes } = request.db.models;

    let DocTypeResult = await DocTypes.findAll({
      where: { Series: Series },
      // attributes: ["Series", "BranchName", "isGroup", "ParentBranch"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.message || "Some error occurred while find one  DocType."
      })
    });

    if (DocTypeResult.length == 0) {
      next(new NotFoundException(Series, "DocType"));
      return;
    }

    console.log("User (action)  : get By DocType [DocType] By : {" + request.userName + "}    Date:" + Date());

    response.send(DocTypeResult);
  };

  getAllDocTypes = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { DocTypes } = request.db.models;

    try {
      await DocTypes.findAll({
        where: { ...filters },
        offset: parseInt(page) * parseInt(pageSize),
        limit: parseInt(pageSize),
      }).then(data => {
        if (data.length == 0) {
          console.log({ message: " there is no data ... in tbl DocType" });
          response.send(data);
        }
        else {
          console.log("User (action)  : getAll [DocType] By : {" + request.userName + "}    Date:" + Date());
          return response.send(data);
        }
      })

    } catch (error) {
      console.log(error)
      response.send(error)
    }

  }



}

export default DocType;
