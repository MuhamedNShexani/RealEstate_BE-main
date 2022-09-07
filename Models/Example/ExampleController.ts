import * as express from "express";
import CreateExampleDto from "./Example.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import authMiddleware from "../../middleware/auth.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import permissionsMiddleware from "../../middleware/permissions.middleware";
// import { Example } from "../../Models";

class ExampleController extends BaseController {
  public get = "/Example/:series";
  public read = "/Example/";
  public delete = "/Example/:series";
  public create = "/Example/";
  public router = express.Router();
  public Example: any; //new Example();
  public DOCTYPE = ["DT-13"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        console.log(req.user.permissions);
        const val = permissionsMiddleware(
          [...this.DOCTYPE, "DT-21", "DT-5", "DT-3", "DT-31", "DT-11"],
          ["Read"],
          req.user.permissions,
          () => this.getExampleById(req, res, next)
        );
        console.log(val);
        if (val) throw val;
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
        console.log(req.user.permissions);
        const val = permissionsMiddleware(
          [...this.DOCTYPE, "DT-21", "DT-5", "DT-3", "DT-31", "DT-11"],
          ["Read"],
          req.user.permissions,
          () => this.getAllExamples(req, res, next)
        );
        console.log(val);
        if (val) throw val;
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
    this.router.post(
      this.create,
      authMiddleware,
      validationMiddleware(CreateExampleDto),
      async (req, res, next) => {
        try {
          console.log(req.user.permissions);
          const val = permissionsMiddleware(
            this.DOCTYPE,
            ["Read"],
            req.user.permissions,
            () => this.createUpdateExample(req, res, next)
          );
          console.log(val);
          if (val) throw val;
        } catch (error) {
          console.log(error);
          next(
            new HttpException(
              error.originalError.status || 400,
              error.originalError.message
            )
          );
        }
      }
    );
    this.router.delete(this.delete, authMiddleware, async (req, res, next) => {
      try {
        console.log(req.user.permissions);
        const val = permissionsMiddleware(
          this.DOCTYPE,
          ["Read"],
          req.user.permissions,
          () => this.deleteExample(req, res, next)
        );
        console.log(val);
        if (val) throw val;
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

  private getExampleById = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { Example } = request.db.models;

    let ExampleResult = await Example.findOne({
      where: { Series: series },
      attributes: ["Series", "Example"],
    });

    if (!Example) {
      next(new NotFoundException(series, "Example"));
      return;
    }

    console.log(ExampleResult);

    response.send(ExampleResult);
  };

  getAllExamples = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { Example } = request.db.models;

    const { count, rows } = await Example.findAndCountAll({
      where: { ...filters },
      attributes: ["Series", "Example"],
      offset: parseInt(page) * parseInt(pageSize),
      limit: parseInt(pageSize),
    });
    response.send({ count, rows });
  };

  createUpdateExample = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const ExampleCreate: CreateExampleDto = request.body;
    const { Example } = request.db.models;

    let ExampleResult = await Example.findOne({
      attributes: ["Series", "Example"],
      order: [["id", "DESC"]],
    });
    let series =
      ExampleCreate.Series !== "" && ExampleCreate.Series
        ? ExampleCreate.Series
        : "Example-" + (parseInt(Example?.Series?.split("-")[1] ?? 0) + 1);
    let result;
    try {
      if (ExampleCreate.Series === "" || ExampleCreate.Series === undefined) {
        result = await Example.create({
          Series: series,
          Example: ExampleCreate.Example,
          ConverstionFactor: ExampleCreate.ConverstionFactor,
          createdBy: request.user.Series,
          createdAt: new Date(),
        });
      } else {
        let oldExample = await Example.findOne({
          attributes: ["Series", "Example"],
          where: {
            Series: series,
          },
        });

        result = await Example.update(
          {
            Example: ExampleCreate.Example,
            ConverstionFactor: ExampleCreate.ConverstionFactor,
            updatedBy: request.user.Series,
            updatedAt: new Date(),
          },
          {
            where: {
              Series: series,
            },
          }
        );
      }
      response.send(result);
    } catch (error) {
      console.log(error);
      next(new HttpException(422, error));
      return;
    }

    next();
  };

  deleteExample = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const ExampleReq = request.params;
    const { Example } = request.db.models;
    let result;
    try {
      const oldExample = await Example.findOne({
        where: { Series: ExampleReq.series },
        attributes: ["Series", "Example"],
      });

      result = await Example.destroy({
        where: {
          Series: ExampleReq.series, //this will be your id that you want to delete
        },
      });
    } catch (error) {
      next(new HttpException(422, error));
      return;
    }

    if (result === 0) {
      next(new NotFoundException(ExampleReq.series, "Example"));
      return;
    } else response.send();

    next();
  };
}

export default ExampleController;
