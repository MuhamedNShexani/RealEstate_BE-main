import * as express from "express";
import CreateCurrency from "./CreateCurrency.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";
//import permissionsMiddleware from "../../middleware/permissions.middleware";

class CurrencyController extends BaseController {
  public get = "/Currency/:series";
  public read = "/Currency/";
  public delete = "/Currency/:series";
  public Update = "/Currency/:series";
  public create = "/Currency/";
  public io;

  public router = express.Router();
  public Currency: any; //new Currency();
  public DOCTYPE = ["DT-15"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getCurrencyBySeries(req, res, next)

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
        this.getAllCurrency(req, res, next)

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
    this.router.put(this.Update, authMiddleware, validationMiddleware(CreateCurrency),
      async (req, res, next) => {
        try {
          this.UpdateCurrency(req, res, next)

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
      validationMiddleware(CreateCurrency),
      async (req, res, next) => {
        try {
          this.createCurrency(req, res, next)

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
        this.deleteCurrency(req, res, next)

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

  private getCurrencyBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { Currency } = request.db.models;

    let CurrencyResult = await Currency.findOne({
      where: { Series: series },
      // attributes: ["Series", "CurrencyName", "Symbol", "Format", "Enabled", "Default"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while find one Currency."
      })
    });

    if (!CurrencyResult) {
      next(new NotFoundException(series, "Currency"));
      return;
    }
    console.log("User (action)  : get By Series [Currency] By : {" + request.userName + "} , Date: " + Date());


    response.send(CurrencyResult);
  };

  getAllCurrency = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { Currency } = request.db.models;

    try {
      const res = await Currency.findAll({
        where: { ...filters },
        order: [["id", "DESC"]],

        // attributes: ["Series", "CurrencyName", "Symbol", "Format", "Enabled", "Default"],
        offset: parseInt(page) * parseInt(pageSize),
        limit: parseInt(pageSize),
      }).then(data => {
        if (data.length == 0) {
          console.log({ message: " there is no data ... in tbl Currency" });
          response.send(data);
        }
        else {
          console.log("User (action)  : getAll [Currency] By : {" + request.userName + "} , Date: " + Date());

          response.send(data);
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while Finding ALl currency."
        })
      });
    } catch (error) {
      console.log(error)
      response.send(error)
    }

  };

  UpdateCurrency = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const CurrencyUpdate: CreateCurrency = request.body;
    const { Currency } = request.db.models;

    let series = request.params.series;
    let result;
    try {
      let oldCurrency = await Currency.findOne({
        where: {
          Series: series,
        },
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while creating Currency."
        })
      });

      result = await Currency.update(
        {
          ...CurrencyUpdate,
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
          console.log("User (action)  : Update [Currency] By : {" + request.userName + "} , Date: " + Date());

          response.status(201).send("updated");
          this.io
            .to(request.UserSeries)
            .emit("Update", { doctype: "Currency", data: CurrencyUpdate });


        }
        else {
          response.status(404).send("Series " + series + " Not found")
        }
      }).catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: " (CurrencyName)  has already used . please try another name ." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating Currency" });
      })


    }
    catch (error) {
      next(new AddingRowException(error, "Currency"));

      return;
    }

    next();
  };
  createCurrency = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const CurrencyCreate: CreateCurrency = request.body;
    const { Currency } = request.db.models;
    let lastSeries;

    await Currency.findOne({

      order: [["id", "DESC"]],
    }).
      then((data: any) => {
        if (!data) {
          lastSeries = 1;
        } else {
          lastSeries = +data.dataValues.Series.substring(4) + 1;
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while retrieving Currency."
        })
      });

    let result;
    try {

      await Currency.create({
        ...CurrencyCreate,
        Series: "CUR-" + lastSeries,
        createdBy: request.userName,
        createdAt: new Date(),
      }).then(data => {
        Currency.Series = data.dataValues.Series;
        console.log("User (action)  : Create New [Currency] By : {" + request.userName + "} , Date: " + Date());

        response.status(201).send(data);
        this.io
          .to(request.UserSeries)
          .emit("Add", { doctype: "Currency", data: data });


      }).catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: " (CurrencyName)  has already used . please try another name ." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating Currency" });
      })

    } catch (error) {
      next(new AddingRowException(error, "Currency"));
      return;
    }

    next();
  };

  deleteCurrency = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const CurrencyReq = request.params;
    const { Currency,CurrentUser } = request.db.models;
    let result;
    try {
      // const oldCurrency = await Currency.findOne({
      //   where: { Series: CurrencyReq.series },
      //   attributes: ["Series", "CurrencyName", "Symbol", "Format", "Enabled", "Default"],
      // });
      await CurrentUser.update(
        {
         CurrentUser:request.userName
        },
        {
          where: {
            ID: 1,
          },
        }
      )
      await Currency.destroy({
        where: {
          Series: CurrencyReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {
          console.log("User (action)  : Delete One [Currency] By : {" + request.userName + "} , Date: " + Date());

          return response.send({
            message: "Currency was deleted successfully!"
          });
        } else {
          this.io
            .to(request.UserSeries)
            .emit("Delete", { doctype: "Currency", data: CurrencyReq });

          return response.send({
            message: `Cannot delete Currency with Series=${CurrencyReq.series}. Maybe Currency was not found!`
          });
        }

      }).catch((err: any) => {
        if(err.name=="SequelizeForeignKeyConstraintError"){
          response.status(400).send({
         message:
          "Sorry You can't delete this because its reference to another page "
       })
       }
       else {
        response.status(400).send({
          message:
            err.name || "Some error occurred while deleting Currency."
        })}
      })

    } catch (error) {
      response.status(400).send({
        message:
          error.message || "Some error occurred while Deleting the Currency."
      });

    }

    next();
  };
}

export default CurrencyController;
