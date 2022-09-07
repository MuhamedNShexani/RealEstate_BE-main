import * as express from "express";
import CreatePermission from "./CreatePermission.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";

class PermissionController extends BaseController {
  public get = "/Permissionw/:series";
  public read = "/Permissionw/";
  public delete = "/Permissionw/:series";
  public Update = "/Permissionw/:series";
  public create = "/Permissionw/";
  public io;

  public router = express.Router();
  public Permission: any; //new Permission();
  public DOCTYPE = ["DT-7"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getPermissionBySeries(req, res, next)

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
        this.getAllPermission(req, res, next)

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
    this.router.put(this.Update, authMiddleware, validationMiddleware(CreatePermission),
      async (req, res, next) => {
        try {
          this.UpdatePermission(req, res, next)

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
      validationMiddleware(CreatePermission),
      async (req, res, next) => {
        try {
          this.createPermission(req, res, next)

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
        this.deletePermission(req, res, next)

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

  private getPermissionBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { Permission } = request.db.models;

    let PermissionResult = await Permission.findOne({
      where: { Series: series },
      // attributes: ["Series", "RoleSeries", "DocTypeID", "Read", "Write", "Create", "Delete"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while find one Permission."
      })
    });

    if (!PermissionResult) {
      next(new NotFoundException(series, "Permission"));
      return;
    }
    console.log("User (action)  : get BY Series [Permission]  By : {" + request.userName + "} , Date:" + Date());

    response.send(PermissionResult);
  };

  getAllPermission = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { Permission } = request.db.models;

    try {
      const res = await Permission.findAll({
        where: { ...filters },
        // attributes: ["Series", "RoleSeries", "DocTypeID", "Read", "Write", "Create", "Delete"],
        offset: parseInt(page) * parseInt(pageSize),
        limit: parseInt(pageSize),
      }).then(data => {
        if (data.length == 0) {
          console.log({ message: " there is no data ... in tbl Permission" });
          
          response.send(data);
        }
        else {
          console.log("User (action)  : getAll [Permission]  By : {" + request.userName + "} , Date:" + Date());
          console.log(data);

          response.status(200).send(data);
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while find All Permission."
        })
      });

    } catch (error) {
      console.log(error)
      response.send(error)
    }




  };

  UpdatePermission = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const PermissionUpdate: CreatePermission = request.body;
    const { Permission } = request.db.models;

    let series = request.params.series;
    let result;
    try {
      let oldPermission = await Permission.findOne({

        where: {
          Series: series,
        },
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while creating Permission."
        })
      });

      result = await Permission.update(
        {
          ...PermissionUpdate,
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
          console.log("User (action)  : Update [Permission]  By : {" + request.userName + "} , Date:" + Date());

          response.status(201).send("updated");
          this.io
            .to(request.UserSeries)
            .emit("Update", { doctype: "Permission", data: PermissionUpdate });


        }
      }).catch((err) => {
        if (err.name == "SequelizeForeignKeyConstraintError") {
          response.status(400).send({ message: "error in forign key (RoleSeries) || should be exist ." });
        }
        else {
          response.status(400).send({ message: err.name || "There is some Error in creating Permission" });
        }
      })

    }
    catch (error) {
      next(new AddingRowException(error, "Permission"));

      return;
    }

    next();
  };
  createPermission = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const PermissionCreate: CreatePermission = request.body;
    const { Permission } = request.db.models;
    let lastSeries;

    await Permission.findOne({
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
            err.name || "Some error occurred while retrieving Permission."
        })
      });

    let result;
    try {

      result = await Permission.create({
        ...PermissionCreate,
        Series: "PER-" + lastSeries,
        createdBy: request.userName,
        createdAt: new Date(),
      }).then(data => {
        Permission.Series = data.dataValues.Series;
        console.log("User (action)  : Create New [Permission]  By : {" + request.userName + "} , Date:" + Date());

        response.status(201).send(data);
        this.io
          .to(request.UserSeries)
          .emit("Add", { doctype: "Permission", data: data });

      }).catch((err) => {
        if (err.name == "SequelizeForeignKeyConstraintError") {
          response.status(400).send({ message: "error in forign key (RoleSeries) || should be exist ." });
        }
        else {
          response.status(400).send({ message: err.name || "There is some Error in creating Permission" });
        }
      })


    } catch (error) {
      next(new AddingRowException(error, "Permission"));
      return;
    }

    next();
  };
  deletePermission = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const PermissionReq = request.params;
    const { Permission } = request.db.models;
    let result;
    try {
      // const oldPermission = await Permission.findOne({
      //   where: { Series: PermissionReq.series },
      //   attributes: ["Series", "RoleSeries", "DocTypeID", "Read", "Write", "Create", "Delete"],
      // }).catch((err: any) => {
      //   response.status(400).send({
      //     message:
      //       err.name || "Some error occurred while finding old permission ."
      //   })
      // });

      await Permission.destroy({
        where: {
          Series: PermissionReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {
          console.log("User (action)  : Delete one [Permission]  By : {" + request.userName + "} , Date:" + Date());

          response.send({
            message: "Permission was deleted successfully!"
          });
        } else {
          return response.send({
            message: `Cannot delete Permission with Series=${PermissionReq.series}. Maybe Permission was not found!`
          });
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while deleting Permission."
        })
      })

      this.io
        .to(request.UserSeries)
        .emit("Delete", { doctype: "Permission", data: PermissionReq });

      next();

    } catch (error) {
      response.status(400).send({
        message:
          error.message || "Some error occurred while Deleting the Permission."
      });

    }


    next();
  };
}

export default PermissionController;
