import * as express from "express";
import CreatePurpose from "./CreatePurpose.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";

class PurposeController extends BaseController {
  public get = "/Purpose/:series";
  public read = "/Purpose/";
  public delete = "/Purpose/:series";
  public Update = "/Purpose/:series";
  public create = "/Purpose/";
  public io;

  public router = express.Router();
  public Purpose: any; //new Purpose();
  public DOCTYPE = ["DT-11"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getPurposeBySeries(req, res, next)

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
        this.getAllPurpose(req, res, next)

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
    this.router.put(this.Update, authMiddleware, validationMiddleware(CreatePurpose),
      async (req, res, next) => {
        try {
          this.UpdatePurpose(req, res, next)

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
      validationMiddleware(CreatePurpose),
      async (req, res, next) => {
        try {
          this.createPurpose(req, res, next)

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
        this.deletePurpose(req, res, next)

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

  private getPurposeBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { Purpose } = request.db.models;

    let PurposeResult = await Purpose.findOne({
      where: { Series: series },
      // attributes: ["Series", "Purpose", "IsPayable", "DefaultAmt", "DefaultCurrency"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while find one Purpose."
      })
    });

    if (!PurposeResult) {
      next(new NotFoundException(series, "Purpose"));
      return;
    }

    console.log("User (action)  : Get by Series [Purpose]  By : {" + request.userName + "} , Date:" + Date());

    response.send(PurposeResult);
  };

  getAllPurpose = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { Purpose } = request.db.models;

    try {
      const res = await Purpose.findAll({
        where: { ...filters },
        order: [["id", "DESC"]],
        // attributes: ["Series", "Purpose", "IsPayable", "DefaultAmt", "DefaultCurrency"],
        offset: parseInt(page) * parseInt(pageSize),
        limit: parseInt(pageSize),
      }).then(data => {
        if (data.length == 0) {
          response.send(data);
          console.log({ message: " there is no data ... in tbl Purpose" });
        }
        else {
          console.log("User (action)  : Get All [Purpose]  By : {" + request.userName + "} , Date:" + Date());

          response.send(data);
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while findAll Purpose."
        })
      });
    } catch (error) {
      console.log(error)
      response.send(error)
    }


  };

  UpdatePurpose = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const PurposeUpdate: CreatePurpose = request.body;
    const { Purpose } = request.db.models;

    let series = request.params.series;
    let result;
    try {
      let oldPurpose = await Purpose.findOne({
        where: {
          Series: series,
        },
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while creating Purpose."
        })
      });

      result = await Purpose.update(
        {
          ...PurposeUpdate,
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
          console.log("User (action)  : Update [Purpose]  By : {" + request.userName + "} , Date:" + Date());

          response.status(201).send("updated");
          this.io
            .to(request.UserSeries)
            .emit("Update", { doctype: "Purpose", data: PurposeUpdate });

        }
        else {
          response.status(404).send("Series " + series + " Not found")
        }
      }).catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: "(Purpose)fieldName has already used . please try another name." });
        } else if (err.name == "SequelizeForeignKeyConstraintError") {
          response.status(400).send({ message: "error in forign key (DefaultCurrency) || should be exist ." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating Purpose" });
      })

    }
    catch (error) {
      next(new AddingRowException(error, "Purpose"));

      return;
    }

    next();
  };
  createPurpose = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const PurposeCreate: CreatePurpose = request.body;
    const { Purpose } = request.db.models;
    let lastSeries;

    await Purpose.findOne({
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
            err.name || "Some error occurred while retrieving Purpose."
        })
      });

    let result;
    try {

      result = await Purpose.create({
        ...PurposeCreate,
        Series: "PUR-" + lastSeries,
        createdBy: request.userName,
        createdAt: new Date(),
      }).then(data => {
        Purpose.Series = data.dataValues.Series;
        console.log("User (action)  : Create New [Purpose]  By : {" + request.userName + "} , Date:" + Date());

        response.status(201).send(data)
        this.io
          .to(request.UserSeries)
          .emit("Add", { doctype: "Purpose", data: data });

      }).catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: "(Purpose)fieldName has already used . please try another name." });
        } else if (err.name == "SequelizeForeignKeyConstraintError") {
          response.status(400).send({ message: "error in forign key (DefaultCurrency) || should be exist ." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating Purpose" });
      })


    } catch (error) {
      next(new AddingRowException(error, "Purpose"));
      return;
    }

    next();
  };

  deletePurpose = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const PurposeReq = request.params;
    const { Purpose,CurrentUser } = request.db.models;
    let result;
    try {
      // const oldPurpose = await Purpose.findOne({
      //   where: { Series: PurposeReq.series },
      //   attributes: ["Series", "Purpose", "IsPayable", "DefaultAmt", "DefaultCurrency"],
      // }).catch((err: any) => {
      //   response.status(400).send({
      //     message:
      //       err.name || "Some error occurred while finding old Purpose."
      //   })
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
      await Purpose.destroy({
        where: {
          Series: PurposeReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {
          console.log("User (action)  : Delete One [Purpose]  By : {" + request.userName + "} , Date:" + Date());

          this.io
            .to(request.UserSeries)
            .emit("Delete", { doctype: "Purpose", data: PurposeReq });

          response.send({
            message: "Purpose was deleted successfully!"
          });
        } else {
          return response.send({
            message: `Cannot delete Purpose with Series=${PurposeReq.series}. Maybe Purpose was not found!`
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
            err.name || "Some error occurred while deleting Purpose."
        })
      }
      })
      next();

    } catch (error) {
      response.status(400).send({
        message:
          error.message || "Some error occurred while Deleting the Purpose."
      });
    }


    next();
  };
}

export default PurposeController;
