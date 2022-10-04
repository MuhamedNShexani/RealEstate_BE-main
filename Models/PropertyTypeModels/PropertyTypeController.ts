import * as express from "express";
import CreatePropertyType from "./CreatePropertyType.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import authMiddleware from "../../middleware/auth.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";

class PropertyTypeController extends BaseController {
  public get = "/PropertyType/:series";
  public read = "/PropertyType/";
  public delete = "/PropertyType/:series";
  public Update = "/PropertyType/:series";
  public create = "/PropertyType/";
  public io;

  public router = express.Router();
  public PropertyType: any; //new PropertyType();
  public DOCTYPE = ["DT-10"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getPropertyTypeBySeries(req, res, next)

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
        this.getAllPropertyType(req, res, next)

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
    this.router.put(this.Update, authMiddleware, validationMiddleware(CreatePropertyType),
      async (req, res, next) => {
        try {
          this.UpdatePropertyType(req, res, next)

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
      validationMiddleware(CreatePropertyType),
      async (req, res, next) => {
        try {
          this.createPropertyType(req, res, next)

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
        this.deletePropertyType(req, res, next)

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

  private getPropertyTypeBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { PropertyType } = request.db.models;

    let PropertyTypeResult = await PropertyType.findOne({
      where: { Series: series },
      // attributes: ["Series", "TypeName"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while find one  PropertyType."
      })
    });

    if (!PropertyTypeResult) {
      next(new NotFoundException(series, "PropertyType"));
      return;
    }

    console.log("User (action)  : Get by Series [PropertyType]  By : {" + request.userName + "} , Date:" + Date());

    response.send(PropertyTypeResult);
  };

  getAllPropertyType = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { PropertyType } = request.db.models;
    await PropertyType.findAll({
      where: {},
      order: [["id", "DESC"]],
      // attributes: ["Series", "TypeName"],
    }).then(data => {
      if (data.length == 0) {
        response.send(data);
        console.log({ message: " there is no data ... in tbl PropertyType" });
      }
      else {
        console.log("User (action)  : GetAll [PropertyType]  By : {" + request.userName + "} , Date:" + Date());

        response.send(data);
      }
    }).catch(err => {
      console.log(err);
      response.send(err)
    });

  };

  UpdatePropertyType = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const PropertyTypeUpdate: CreatePropertyType = request.body;
    const { PropertyType } = request.db.models;

    let series = request.params.series;
    let result;
    try {
      let oldPropertyType = await PropertyType.findOne({
        where: {
          Series: series,
        },
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while creating PropertyType."
        })
      });

      result = await PropertyType.update(
        {
          ...PropertyTypeUpdate,
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
          console.log("User (action)  : Update [PropertyType]  By : {" + request.userName + "} , Date:" + Date());

          response.status(201).send("updated");
          this.io
            .to(request.UserSeries)
            .emit("Update", { doctype: "PropertyType", data: PropertyTypeUpdate });
        }
        else {
          response.status(404).send("Series " + series + " Not found")
        }
      }).catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: " (TypeName)  has already used . please try another name ." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating PropertyType" });
      })

    }
    catch (error) {
      next(new AddingRowException(error, "PropertyType"));

      return;
    }

    next();
  };
  createPropertyType = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const PropertyTypeCreate: CreatePropertyType = request.body;
    const { PropertyType } = request.db.models;
    let lastSeries;

    await PropertyType.findOne({
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
            err.name || "Some error occurred while retrieving PropertyType."
        })
      });
    let result;
    try {

      result = await PropertyType.create({
        ...PropertyTypeCreate,
        Series: "PROPTYPE-" + lastSeries,
        createdBy: request.userName,
        createdAt: new Date(),
      }).then(data => {
        PropertyType.Series = data.dataValues.Series;
        console.log("User (action)  : Create New [PropertyType]  By : {" + request.userName + "} , Date:" + Date());

        response.status(201).send(data);
        this.io
          .to(request.UserSeries)
          .emit("Add", { doctype: "PropertyType", data: data });

      }).catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: " (TypeName)  has already used . please try another name ." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating PropertyType" });
      })



    } catch (error) {
      next(new AddingRowException(error, "PropertyType"));
      return;
    }

    next();
  };

  deletePropertyType = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const PropertyTypeReq = request.params;
    const { PropertyType,CurrentUser } = request.db.models;
    let result;
    try {
      // const oldPropertyType = await PropertyType.findOne({
      //   where: { Series: PropertyTypeReq.series },
      //   attributes: ["Series", "TypeName"],
      // }).catch((err: any) => {
      //   response.status(400).send({
      //     message:
      //       err.name || "Some error occurred while finding old PropertyType."
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
      await PropertyType.destroy({
        where: {
          Series: PropertyTypeReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {
          console.log("User (action)  : Delete One [PropertyType]  By : {" + request.userName + "} , Date: " + Date());

          response.send({
            message: "PropertyType was deleted successfully!"
          });
        } else {
          return response.send({
            message: `Cannot delete PropertyType with Series=${PropertyTypeReq.series}. Maybe PropertyType was not found!`
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
            err.name || "Some error occurred while deleting PropertyType."
        })}
      })
      this.io
        .emit("Delete", { doctype: "PropertyType", data: PropertyTypeReq });
      this.io
        .to(request.UserSeries)

      next();

    } catch (error) {
      response.status(400).send({
        message:
          error.message || "Some error occurred while Deleting the PropertyType."
      });

    }

    next();
  };
}

export default PropertyTypeController;
