import * as express from "express";
import CreateRoles from "./CreateRoles.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";

class RolesController extends BaseController {
  public get = "/Roles/:series";
  public read = "/Roles/";
  public delete = "/Roles/:series";
  public Update = "/Roles/:series";
  public create = "/Roles/";
  public io;

  public router = express.Router();
  public Roles: any; //new Roles();
  public DOCTYPE = ["DT-12"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getRolesBySeries(req, res, next)

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
        this.getAllRoles(req, res, next)

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
    this.router.put(this.Update, authMiddleware, validationMiddleware(CreateRoles),
      async (req, res, next) => {
        try {
          this.UpdateRoles(req, res, next)

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
      validationMiddleware(CreateRoles),
      async (req, res, next) => {
        try {
          this.createRoles(req, res, next)

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
        this.deleteRoles(req, res, next)

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

  private getRolesBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { Roles } = request.db.models;

    let RolesResult = await Roles.findOne({
      where: { Series: series },
      // attributes: ["Series", "RoleName"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while find one Roles."
      })
    });

    if (!RolesResult) {
      next(new NotFoundException(series, "Roles"));
      return;
    }
    console.log("User (action)  : Get By Series [Roles]  By : {" + request.userName + "} , Date:" + Date());


    response.send(RolesResult);
  };

  getAllRoles = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { Roles } = request.db.models;

    try {
      const res = await Roles.findAll({
        where: { ...filters },
        // attributes: ["Series", "RoleName"],
        order: [["id", "DESC"]],
        offset: parseInt(page) * parseInt(pageSize),
        limit: parseInt(pageSize),
      }).then(data => {
        if (data.length == 0) {
          console.log({ message: " there is no data ... in tbl Roles" });
          response.send(data);
        }
        else {
          console.log("User (action)  : GetAll [Roles]  By : {" + request.userName + "} , Date:" + Date());

          response.send(data);
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while finding all Roles."
        })
      });

    } catch (error) {
      console.log(error)
      response.send(error)
    }


  };

  UpdateRoles = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const RolesUpdate: CreateRoles = request.body;
    const { Roles } = request.db.models;

    let series = request.params.series;
    let result;
    try {
      let oldRoles = await Roles.findOne({
        where: {
          Series: series,
        },
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while creating Roles."
        })
      });
      console.log(RolesUpdate);


      result = await Roles.update(
        {
          RoleName: RolesUpdate.RoleName,
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
          console.log("User (action)  : Update [Roles]  By : {" + request.userName + "} , Date:" + Date());

          response.status(201).send("updated");
          this.io
            .to(request.UserSeries)
            .emit("Update", { doctype: "Roles", data: RolesUpdate });

        }
        else {
          response.status(404).send("Series " + series + " Not found")
        }
      }).catch((err) => {
        console.log(err);

        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: "(RoleName) has already used . please try another name." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating Role" });
      })

    }
    catch (error) {
      next(new AddingRowException(error, "Roles"));

      return;
    }

    next();
  };
  createRoles = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const RolesCreate: CreateRoles = request.body;
    const { Roles } = request.db.models;
    let lastSeries;

    await Roles.findOne({
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
            err.name || "Some error occurred while retrieving Roles."
        })
      });

    let result;
    try {

      result = await Roles.create({
        ...RolesCreate,
        Series: "ROL-" + lastSeries,
        createdBy: request.userName,
        createdAt: new Date(),
      }).then(data => {
        Roles.Series = data.dataValues.Series;
        console.log("User (action)  : Create New [Roles]  By : {" + request.userName + "} , Date:" + Date());

        response.status(201).send(data)
        this.io
          .to(request.UserSeries)
          .emit("Add", { doctype: "Roles", data: data });


      }).catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: "(RoleName) has already used . please try another name." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating Role" });
      })


    } catch (error) {
      next(new AddingRowException(error, "Roles"));
      return;
    }

    next();
  };

  deleteRoles = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const RolesReq = request.params;
    const { Roles, CurrentUser } = request.db.models;
    let result;
    try {
      // const oldRoles = await Roles.findOne({
      //   where: { Series: RolesReq.series },
      //   attributes: ["Series", "RoleName"],
      // }).catch((err: any) => {
      //   response.status(400).send({
      //     message:
      //       err.name || "Some error occurred while finding old Roles."
      //   })
      // });
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
      await Roles.destroy({
        where: {
          Series: RolesReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {
          console.log("User (action)  : Delete One [Roles]  By : {" + request.userName + "} , Date:" + Date());

          this.io
            .to(request.UserSeries)
            .emit("Delete", { doctype: "Roles", data: RolesReq });
          response.send({
            message: "Roles was deleted successfully!"
          });
        } else {
          return response.send({
            message: `Cannot delete Roles with Series=${RolesReq.series}. Maybe Roles was not found!`
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
              err.name || "Some error occurred while deleting Roles."
          })
        }
      })
      next();

    } catch (error) {
      response.status(400).send({
        message:
          error.message || "Some error occurred while Deleting the Roles."
      });
    }

    next();
  };
}

export default RolesController;
