import * as express from "express";
import CreatePerms from "./CreatePerms.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";

class PermsController extends BaseController {
  public get = "/Permission/:series";
  public read = "/Permission/";
  public delete = "/Permission/:series";
  public Update = "/Permission/:series";
  public create = "/Permission/";
  public io;

  public router = express.Router();
  public Perms: any; //new Perms();
  public DOCTYPE = ["DT-7"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getPermsBySeries(req, res, next)

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
        this.getAllPerms(req, res, next)

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
    this.router.put(this.Update, authMiddleware, validationMiddleware(CreatePerms),
      async (req, res, next) => {
        try {
          this.UpdatePerms(req, res, next)

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
      validationMiddleware(CreatePerms),
      async (req, res, next) => {
        try {
          this.createPerms(req, res, next)

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
        this.deletePerms(req, res, next)

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

  private getPermsBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { Perms } = request.db.models;
    console.log(series);

    let PermsResult = await Perms.findOne({
      where: { series: series },
      // attributes: ["Series", "RoleSeries", "DocTypeID", "Read", "Write", "Create", "Delete"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while find one Perms."
      })
    });

    if (!PermsResult) {
      console.log("error");

      next(new NotFoundException(series, "Perms"));
      return;
    }
    console.log("User (action)  : get BY Series [Perms]  By : {" + request.userName + "} , Date:" + Date());
    // PermsResult.dataValues.JsonData=PermsResult.dataValues.JsonData==null?[]:JSON.parse(PermsResult.dataValues.JsonData)
    response.send(PermsResult);
  };

  getAllPerms = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { Perms } = request.db.models;

    try {
      const res = await Perms.findAll({
        where: { ...filters }
        // attributes: ["Series", "RoleSeries", "DocTypeID", "Read", "Write", "Create", "Delete"],
        // offset: parseInt(page) * parseInt(pageSize),
        // limit: parseInt(pageSize),
      }).then(data => {
        if (data.length == 0) {
          console.log({ message: " there is no data ... in tbl Perms" });
          response.send(data);
        }
        else {
          console.log("User (action)  : getAll [Perms]  By : {" + request.userName + "} , Date:" + Date());
          response.status(200).send(data);
        }
      }).catch((err: any) => {
        console.log(err);

        response.status(400).send({
          message:
            err.name || "Some error occurred while find All Perms."
        })
      });

    } catch (error) {
      console.log(error)
      response.send(error)
    }




  };

  UpdatePerms = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const PermsUpdate: CreatePerms = request.body;

    const { Perms } = request.db.models;
    let series = request.params.series;
    let result;
    try {
      let oldPerms = await Perms.findOne({

        where: {
          series: series,
        },
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while creating Perms."
        })
      });

      result = await Perms.update(
        {
          JsonData: JSON.stringify(request.body.JsonData),
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
          console.log("User (action)  : Update [Perms]  By : {" + request.userName + "} , Date:" + Date());

          response.status(201).send("updated");
          this.io
            .to(request.UserSeries)
            .emit("Update", { doctype: "Permission", data: PermsUpdate });


        }
      }).catch((err) => {
        console.log(err);

        if (err.name == "SequelizeForeignKeyConstraintError") {
          response.status(400).send({ message: "error in forign key (RoleSeries) || should be exist ." });
        }
        else {
          response.status(400).send({ message: err.name || "There is some Error in creating Perms" });
        }
      })

    }
    catch (error) {
      console.log(error);

      next(new AddingRowException(error, "Perms"));

      return;
    }

    next();
  };
  createPerms = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    // const PermsCreate: CreatePerms = request.body;
    const { Perms } = request.db.models;
    let lastSeries;
    console.log(request.body);

    await Perms.findOne({
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
            err.name || "Some error occurred while retrieving Perms."
        })
      });

    let result;
    try {
      await Perms.create({
        Series: "PER-" + lastSeries,
        RoleSeries: request.body.RoleSeries,
        JsonData: JSON.stringify(request.body.JsonData),
        createdBy: request.userName,
        createdAt: new Date(),
      }).then(data => {
        Perms.Series = data.dataValues.Series;
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
      next(new AddingRowException(error, "DocTypePermissions"));
      return;
    }

    next();
  };
  deletePerms = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const PermsReq = request.params;
    const { Perms } = request.db.models;
    let result;
    try {
      // const oldPerms = await Perms.findOne({
      //   where: { Series: PermsReq.series },
      //   attributes: ["Series", "RoleSeries", "DocTypeID", "Read", "Write", "Create", "Delete"],
      // }).catch((err: any) => {
      //   response.status(400).send({
      //     message:
      //       err.name || "Some error occurred while finding old Perms ."
      //   })
      // });

      await Perms.destroy({
        where: {
          Series: PermsReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {
          console.log("User (action)  : Delete one [Perms]  By : {" + request.userName + "} , Date:" + Date());

          response.send({
            message: "Perms was deleted successfully!"
          });
        } else {
          return response.send({
            message: `Cannot delete Perms with Series=${PermsReq.series}. Maybe Perms was not found!`
          });
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while deleting Perms."
        })
      })

      this.io
        .to(request.UserSeries)
        .emit("Delete", { doctype: "Permission", data: PermsReq });

      next();

    } catch (error) {
      response.status(400).send({
        message:
          error.message || "Some error occurred while Deleting the Perms."
      });

    }


    next();
  };
}

export default PermsController;
