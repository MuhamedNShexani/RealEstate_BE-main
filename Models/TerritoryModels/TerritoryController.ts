import * as express from "express";
import CreateTerritory from "./CreateTerritory.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";

class TerritoryController extends BaseController {
  public get = "/Territory/:series";
  public read = "/Territory/";
  public delete = "/Territory/:series";
  public Update = "/Territory/:series";
  public create = "/Territory/";
  public io;

  public router = express.Router();
  public Territory: any; //new Territory();
  public DOCTYPE = ["DT-13"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getTerritoryBySeries(req, res, next)

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
        this.getAllTerritory(req, res, next)

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
    this.router.put(this.Update, authMiddleware, validationMiddleware(CreateTerritory),
      async (req, res, next) => {
        try {
          this.UpdateTerritory(req, res, next)

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
    this.router.post(
      this.create,
      authMiddleware,
      validationMiddleware(CreateTerritory),
      async (req, res, next) => {
        try {
          this.createTerritory(req, res, next)

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
        this.deleteTerritory(req, res, next)

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

  private getTerritoryBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { Territory } = request.db.models;

    let TerritoryResult = await Territory.findOne({
      where: { Series: series },
      // attributes: ["Series", "Territory", "Parent", "isGroup"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while find one Territory."
      })
    });

    if (!TerritoryResult) {
      next(new NotFoundException(series, "Territory"));
      return;
    }
    console.log("User (action)  : Get by Series [Territory]  By : {" + request.userName + "} , Date:" + Date());


    response.send(TerritoryResult);
  };

  getAllTerritory = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { Territory } = request.db.models;

    try {
      const res = await Territory.findAll({
        where: { ...filters },
        // attributes: ["Series", "Territory", "Parent", "isGroup"],
        offset: parseInt(page) * parseInt(pageSize),
        limit: parseInt(pageSize),
      }).then(data => {
        if (data.length == 0) {
          response.send(data);
          console.log({ message: " there is no data ... in tbl Territory" });
        }
        else {
          console.log("User (action)  : Get All [Territory]  By : {" + request.userName + "} , Date:" + Date());

          response.send(data);
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while finding all Territory."
        })
      });
    } catch (error) {
      console.log(error)
      response.send(error)
    }
  };

  UpdateTerritory = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    let TerritoryUpdate: CreateTerritory = request.body;
    const { Territory } = request.db.models;

    let series = request.params.series;
    let result;
    try {
      let oldTerritory = await Territory.findOne({
        where: {
          Series: series,
        },
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while creating Territory."
        })
      });


      result = await Territory.update(
        {
          Territory: TerritoryUpdate.Territory,
          isGroup: TerritoryUpdate.isGroup,
          parent: TerritoryUpdate.Parent,
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
          console.log("User (action)  : Update [Territory]  By : {" + request.userName + "} , Date:" + Date());

          response.status(201).send("updated");
          this.io
            .to(request.UserSeries)
            .emit("Update", { doctype: "Territory", data: TerritoryUpdate });
        }
        else {
          response.status(404).send("Series " + series + " Not found")
        }
      }).catch((err) => {
        // console.log(err);

        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: "(Territory)fieldName has already used . please try another name." });
        } else if (err.name == "SequelizeForeignKeyConstraintError") {
          response.status(400).send({ message: "error in forign key (Parent) || should be exist or null." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating Terrirtory" });
      })



    }
    catch (error) {
      next(new AddingRowException(error, "Territory"));

      return;
    }

    next();
  };
  createTerritory = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const TerritoryCreate: CreateTerritory = request.body;
    const { Territory } = request.db.models;
    let lastSeries;

    await Territory.findOne({

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
            err.name || "Some error occurred while retrieving Territory."
        })
      });
    let result;

    try {

      result = await Territory.create({
        ...TerritoryCreate,
        Series: "TER-" + lastSeries,
        createdBy: request.userName,
        createdAt: new Date(),
      }).then(data => {
        Territory.Series = data.dataValues.Series;
        console.log("User (action)  : Create New [Territory]  By : {" + request.userName + "} , Date:" + Date());

        response.status(201).send(data)

        this.io
          .to(request.UserSeries)
          .emit("Add", { doctype: "Territory", data: data });

      }).catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: "(Territory)fieldName has already used . please try another name." });
        } else if (err.name == "SequelizeForeignKeyConstraintError") {
          response.status(400).send({ message: "error in forign key (Parent) || should be exist or null." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating Terrirtory" });
      })


    } catch (error) {
      next(new AddingRowException(error, "Territory"));
      return;
    }

    next();
  };


  deleteTerritory = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const TerritoryReq = request.params;
    const { Territory } = request.db.models;
    let result;
    try {
      // const oldTerritory = await Territory.findOne({
      //   where: { Series: TerritoryReq.series },
      //   attributes: ["Series", "Territory", "Parent", "isGroup"],
      // }).catch((err: any) => {
      //   response.status(400).send({
      //     message:
      //       err.name || "Some error occurred while finding old Territory."
      //   })
      // });

      await Territory.destroy({
        where: {
          Series: TerritoryReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {
          console.log("User (action)  : Delete One [Territory]  By : {" + request.userName + "} , Date:" + Date());
          this.io
            .to(request.UserSeries)
            .emit("Delete", { doctype: "Territory", data: TerritoryReq });

          response.send({
            message: "Territory was deleted successfully!"
          });
        } else {
          return response.send({
            message: `Cannot delete Territory with Series=${TerritoryReq.series}. Maybe Territory was not found!`
          });
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while deleting Territory."
        })
      })
      next();

    } catch (error) {
      response.status(400).send({
        message:
          error.message || "Some error occurred while Deleting the Territory."
      });

    }



    next();
  };
}

export default TerritoryController;
