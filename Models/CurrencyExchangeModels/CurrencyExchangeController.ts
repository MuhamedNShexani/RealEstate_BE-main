import * as express from "express";
import CreateCurrencyExchange from "./CreateCurrencyExchange.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";
//import permissionsMiddleware from "../../middleware/permissions.middleware";

class CurrencyExchangeController extends BaseController {
  public get = "/CurrencyExchange/:series";
  public read = "/CurrencyExchange/";
  public delete = "/CurrencyExchange/:series";
  public Update = "/CurrencyExchange/:series";
  public create = "/CurrencyExchange/";
  public io;

  public router = express.Router();
  public CurrencyExchange: any; //new CurrencyExchange();
  public DOCTYPE = ["DT-15"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getCurrencyExchangeBySeries(req, res, next)

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
        this.getAllCurrencyExchange(req, res, next)

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
    this.router.put(this.Update, authMiddleware, validationMiddleware(CreateCurrencyExchange),
      async (req, res, next) => {
        try {
          this.UpdateCurrencyExchange(req, res, next)

        } catch (error) {
          next(
            new HttpException(
              error.originalError.status || 400,
              error.originalError.message
            )
          );
        }
      }
    );
    this.router.post(
      this.create,
      authMiddleware,
      validationMiddleware(CreateCurrencyExchange),
      async (req, res, next) => {
        try {
          this.createCurrencyExchange(req, res, next)

        } catch (error) {
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
        this.deleteCurrencyExchange(req, res, next)

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

  private getCurrencyExchangeBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { CurrencyExchange } = request.db.models;

    let CurrencyExchangeResult = await CurrencyExchange.findOne({
      where: { Series: series },
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while find one CurrencyExchange."
      })
    });

    if (!CurrencyExchangeResult) {
      next(new NotFoundException(series, "CurrencyExchange"));
      return;
    }
    console.log("User (action)  : get By Series [CurrencyExchange] By : {" + request.userName + "} , Date: " + Date());


    response.send(CurrencyExchangeResult);
  };

  getAllCurrencyExchange = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { CurrencyExchange } = request.db.models;

    try {
      const res = await CurrencyExchange.findAll({
        where: { ...filters },
        // attributes: ["Series", "CurrencyExchangeName", "Symbol", "Format", "Enabled", "Default"],
        offset: parseInt(page) * parseInt(pageSize),
        limit: parseInt(pageSize),
      }).then(data => {
        if (data.length == 0) {
          console.log({ message: " there is no data ... in tbl CurrencyExchange" });
          response.send(data);
        }
        else {
          console.log("User (action)  : getAll [CurrencyExchange] By : {" + request.userName + "} , Date: " + Date());

          response.send(data);
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while Finding ALl CurrencyExchange."
        })
      });
    } catch (error) {
      console.log(error)
      response.send(error)
    }

  };

  UpdateCurrencyExchange = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const CurrencyExchangeUpdate: CreateCurrencyExchange = request.body;
    const { CurrencyExchange } = request.db.models;

    let series = request.params.series;
    let result;
    try {
      let oldCurrencyExchange = await CurrencyExchange.findOne({
        where: {
          Series: series,
        },
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while creating CurrencyExchange."
        })
      });

      result = await CurrencyExchange.update(
        {
          ...CurrencyExchangeUpdate,
          updatedBy: request.userName,
          updatedAt: new Date(),
        },
        {
          where: {
            Series: series,
          },
        }
      ).then(data => {
        if (data[0] == 1) {
          console.log("User (action)  : Update [CurrencyExchange] By : {" + request.userName + "} , Date: " + Date());

          response.status(201).send("updated");
          this.io
            .to(request.UserSeries)
            .emit("Update", { doctype: "CurrencyExchange", data: CurrencyExchangeUpdate });


        }
        else {
          response.status(404).send("Series " + series + " Not found")
        }
      }).catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: " (CurrencyExchangeName)  has already used . please try another name ." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating CurrencyExchange" });
      })


    }
    catch (error) {
      next(new AddingRowException(error, "CurrencyExchange"));

      return;
    }

    next();
  };
  createCurrencyExchange = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const CurrencyExchangeCreate: CreateCurrencyExchange = request.body;
    const { CurrencyExchange } = request.db.models;
    let lastSeries;

    await CurrencyExchange.findOne({

      order: [["id", "DESC"]],
    }).
      then((data: any) => {
        if (!data) {
          lastSeries = 1;
        } else {
          lastSeries = +data.dataValues.Series.substring(7) + 1;
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while retrieving CurrencyExchange."
        })
      });

    let result;
    try {

      await CurrencyExchange.create({
        ...CurrencyExchangeCreate,
        Series: "CUR_EX-" + lastSeries,
        createdBy: request.userName,
        createdAt: new Date(),
      }).then(data => {
        CurrencyExchange.Series = data.dataValues.Series;
        console.log("User (action)  : Create New [CurrencyExchange] By : {" + request.userName + "} , Date: " + Date());

        response.status(201).send(data);
        this.io
          .to(request.UserSeries)
          .emit("Add", { doctype: "CurrencyExchange", data: data });


      }).catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: " (CurrencyExchangeName)  has already used . please try another name ." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating CurrencyExchange" });
      })

    } catch (error) {
      next(new AddingRowException(error, "CurrencyExchange"));
      return;
    }

    next();
  };

  deleteCurrencyExchange = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const CurrencyExchangeReq = request.params;
    const { CurrencyExchange } = request.db.models;
    let result;
    try {
      // const oldCurrencyExchange = await CurrencyExchange.findOne({
      //   where: { Series: CurrencyExchangeReq.series },
      //   attributes: ["Series", "CurrencyExchangeName", "Symbol", "Format", "Enabled", "Default"],
      // });

      await CurrencyExchange.destroy({
        where: {
          Series: CurrencyExchangeReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {
          console.log("User (action)  : Delete One [CurrencyExchange] By : {" + request.userName + "} , Date: " + Date());

          return response.send({
            message: "CurrencyExchange was deleted successfully!"
          });
        } else {
          this.io
            .to(request.UserSeries)
            .emit("Delete", { doctype: "CurrencyExchange", data: CurrencyExchangeReq });

          return response.send({
            message: `Cannot delete CurrencyExchange with Series=${CurrencyExchangeReq.series}. Maybe CurrencyExchange was not found!`
          });
        }

      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while deleting CurrencyExchange."
        })
      })

    } catch (error) {
      response.status(400).send({
        message:
          error.message || "Some error occurred while Deleting the CurrencyExchange."
      });

    }

    next();
  };
}

export default CurrencyExchangeController;
