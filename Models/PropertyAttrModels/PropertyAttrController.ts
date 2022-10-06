import * as express from "express";
import CreatePropertyAttr from "./CreatePropertyAttr.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";

class PropertyAttrController extends BaseController {
  public get = "/PropertyAttr/:series";
  public read = "/PropertyAttr/";
  public delete = "/PropertyAttr/:series";
  public Update = "/PropertyAttr/:series";
  public create = "/PropertyAttr/";
  public io;

  public router = express.Router();
  public PropertyAttr: any; //new PropertyAttr();
  public DOCTYPE = ["DT-9"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getPropertyAttrBySeries(req, res, next)

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
        this.getAllPropertyAttr(req, res, next)

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
    this.router.put(this.Update, authMiddleware, validationMiddleware(CreatePropertyAttr),
      async (req, res, next) => {
        try {
          this.UpdatePropertyAttr(req, res, next)

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
      validationMiddleware(CreatePropertyAttr),
      async (req, res, next) => {
        try {
          this.createPropertyAttr(req, res, next)

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
        this.deletePropertyAttr(req, res, next)

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

  private getPropertyAttrBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { PropertyAttr } = request.db.models;

    let PropertyAttrResult = await PropertyAttr.findOne({
      where: { Series: series },
      // attributes: ["Series", "Attribute"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while find one PropertyAttr."
      })
    });

    if (!PropertyAttrResult) {
      next(new NotFoundException(series, "PropertyAttr"));
      return;
    }
    console.log("User (action)  : get By Series [PropertyAttr]  By : {" + request.userName + "} , Date:" + Date());

    response.send(PropertyAttrResult);
  };

  getAllPropertyAttr = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { PropertyAttr } = request.db.models;

    try {
      const res = await PropertyAttr.findAll({
        where: { ...filters },
        // attributes: ["Series", "Attribute"],
        offset: parseInt(page) * parseInt(pageSize),
        order: [["id", "DESC"]],
        limit: parseInt(pageSize),
      }).then(data => {
        if (data.length == 0) {
          console.log({ message: " there is no data ... in tbl PropertyAttr" });
          response.send(data);
        }
        else {
          console.log("User (action)  : getAll [PropertyAttr]  By : {" + request.userName + "} , Date:" + Date());

          response.send(data);
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while findALl  PropertyAttr."
        })
      });
    } catch (error) {
      console.log(error)
      response.send(error)
    }




  };

  UpdatePropertyAttr = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const PropertyAttrUpdate: CreatePropertyAttr = request.body;
    const { PropertyAttr } = request.db.models;

    let series = request.params.series;
    let result;
    try {
      let oldPropertyAttr = await PropertyAttr.findOne({
        where: {
          Series: series,
        },
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while creating PropertyAttr."
        })
      });

      result = await PropertyAttr.update(
        {
          ...PropertyAttrUpdate,
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
          console.log("User (action)  : Update [PropertyAttr]  By : {" + request.userName + "} , Date: " + Date());

          response.status(201).send("updated");
          this.io
            .to(request.UserSeries)
            .emit("Update", { doctype: "PropertyAttr", data: PropertyAttrUpdate });


        }
        else {
          response.status(404).send("Series " + series + " Not found")
        }

      }).catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: " (Attribute)  has already used . please try another name ." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating PropertyAttr" });
      })

    }
    catch (error) {
      next(new AddingRowException(error, "PropertyAttr"));

      return;
    }

    next();
  };
  createPropertyAttr = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const PropertyAttrCreate: CreatePropertyAttr = request.body;
    const { PropertyAttr } = request.db.models;
    let lastSeries;

    await PropertyAttr.findOne({

      order: [["id", "DESC"]],
    }).
      then((data: any) => {
        if (!data) {
          lastSeries = 1;
        } else {
          lastSeries = +data.dataValues.Series.substring(9) + 1;
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while retrieving PropertyAttr."
        })
      });
    let result;
    try {

      result = await PropertyAttr.create({
        ...PropertyAttrCreate,
        Series: "PROPATTR-" + lastSeries,
        createdBy: request.userName,
        createdAt: new Date(),
      }).then(data => {
        PropertyAttr.Series = data.dataValues.Series;
        console.log("User (action)  : Create New [PropertyAttr]  By : {" + request.userName + "} , Date:" + Date());

        response.status(201).send(data);
        this.io
          .to(request.UserSeries)
          .emit("Add", { doctype: "PropertyAttr", data: data });

      }).catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: " (Attribute)  has already used . please try another name ." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating PropertyAttr" });
      })



    } catch (error) {
      next(new AddingRowException(error, "PropertyAttr"));
      return;
    }

    next();
  };

  deletePropertyAttr = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const PropertyAttrReq = request.params;
    const { PropertyAttr, CurrentUser } = request.db.models;
    let result;
    try {

      await CurrentUser.update(
        {
          CurrentUser: request.userName
        },
        {
          where: {
            ID: 1,
          },
        }
      )
      await PropertyAttr.destroy({
        where: {
          Series: PropertyAttrReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {
          console.log("User (action)  : Delete One [PropertyAttr]  By : {" + request.userName + "} , Date:" + Date());

          response.send({
            message: "PropertyAttr was deleted successfully!"
          });
        } else {
          return response.send({
            message: `Cannot delete PropertyAttr with Series=${PropertyAttrReq.series}. Maybe PropertyAttr was not found!`
          });
        }
      }).catch((err: any) => {
        if (err.name == "SequelizeForeignKeyConstraintError") {
          response.status(400).send({
            message:
              "Sorry You can't delete this because its reference to another page "
          })
        }
        else {
          response.status(400).send({
            message:
              err.name || "Some error occurred while deleting PropertyAttr."
          })
        }
      })
      this.io
        .to(request.UserSeries)
        .emit("Delete", { doctype: "PropertyAttr", data: PropertyAttrReq });

      next();

    } catch (error) {
      response.status(400).send({
        message:
          error.message || "Some error occurred while Deleting the PropertyAttr."
      });
    }

    next();
  };
}

export default PropertyAttrController;
