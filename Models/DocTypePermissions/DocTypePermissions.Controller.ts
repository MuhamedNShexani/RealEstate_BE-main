import * as express from "express";
import CreateDocTypePermissions from "./DocTypePermissions.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";

class DocTypePermissionsController extends BaseController {
  public get = "/DocTypePermissions/:series";
  public read = "/DocTypePermissions/";
  public delete = "/DocTypePermissions/:series";
  public Update = "/DocTypePermissions/:param1?&:param2";
  public create = "/DocTypePermissions/";
  public io;

  public router = express.Router();
  public DocTypePermissions: any; //new DocTypePermissions();
  public DOCTYPE = ["DT-7"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getDocTypePermissionsBySeries(req, res, next)

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
        this.getAllDocTypePermissions(req, res, next)

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
    this.router.put(this.Update, authMiddleware, validationMiddleware(CreateDocTypePermissions),
      async (req, res, next) => {
        try {
          this.UpdateDocTypePermissions(req, res, next)

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
      validationMiddleware(CreateDocTypePermissions),
      async (req, res, next) => {
        try {
          this.createDocTypePermissions(req, res, next)

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
        this.deleteDocTypePermissions(req, res, next)

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

  private getDocTypePermissionsBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { DocTypePermissions } = request.db.models;

    let DocTypePermissionsResult = await DocTypePermissions.findOne({
      where: { Series: series },
      // attributes: ["Series", "RoleSeries", "DocTypeID", "Read", "Write", "Create", "Delete"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while find one DocTypePermissions."
      })
    });

    if (!DocTypePermissionsResult) {
      next(new NotFoundException(series, "DocTypePermissions"));
      return;
    }
    console.log("User (action)  : get BY Series [DocTypePermissions]  By : {" + request.userName + "} , Date:" + Date());

    response.send(DocTypePermissionsResult);
  };

  getAllDocTypePermissions = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { DocTypePermissions } = request.db.models;

    try {
      const res = await DocTypePermissions.findAll({
        where: { ...filters },
        // attributes: ["Series", "RoleSeries", "DocTypeID", "Read", "Write", "Create", "Delete"],
        offset: parseInt(page) * parseInt(pageSize),
        limit: parseInt(pageSize),
      }).then(data => {
        if (data.length == 0) {
          console.log({ message: " there is no data ... in tbl DocTypePermissions" });
          response.send(data);
        }
        else {
          console.log("User (action)  : getAll [DocTypePermissions]  By : {" + request.userName + "} , Date:" + Date());

          response.status(200).send(data);
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while find All DocTypePermissions."
        })
      });

    } catch (error) {
      console.log(error)
      response.send(error)
    }




  };

  UpdateDocTypePermissions = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const DocTypePermissionsUpdate: CreateDocTypePermissions = request.body;

    const { DocTypePermissions } = request.db.models;
    let docTypeID = request.params.param2;
    let series = request.params.param1;
    let result;
    try {
      let oldDocTypePermissions = await DocTypePermissions.findOne({

        where: {
          Series: series,
        },
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while creating DocTypePermissions."
        })
      });

      result = await DocTypePermissions.update(
        {
          ...DocTypePermissionsUpdate,
          updatedBy: request.userName,
          updatedAt: new Date(),
        },
        {
          where: {
            Series: series,
            DocTypeID:docTypeID
          },
        }
      ).then(data => {
        if (data[0] == 1) {
          console.log("User (action)  : Update [DocTypePermissions]  By : {" + request.userName + "} , Date:" + Date());

          response.status(201).send("updated");
          this.io
            .to(request.UserSeries)
            .emit("Update", { doctype: "DocTypePermissions", data: DocTypePermissionsUpdate });


        }
      }).catch((err) => {
        if (err.name == "SequelizeForeignKeyConstraintError") {
          response.status(400).send({ message: "error in forign key (RoleSeries) || should be exist ." });
        }
        else {
          response.status(400).send({ message: err.name || "There is some Error in creating DocTypePermissions" });
        }
      })

    }
    catch (error) {
      next(new AddingRowException(error, "DocTypePermissions"));

      return;
    }

    next();
  };
  createDocTypePermissions = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const DocTypePermissionsCreate: CreateDocTypePermissions = request.body;
    const { DocTypePermissions } = request.db.models;
    let lastSeries;
console.log(request.body);

    await DocTypePermissions.findOne({
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
            err.name || "Some error occurred while retrieving DocTypePermissions."
        })
      });

    let result;
    try {

      result = await DocTypePermissions.create({
        ...DocTypePermissionsCreate,
        Series: "PER-" + lastSeries,
        createdBy: request.userName,
        createdAt: new Date(),
      }).then(data => {
        DocTypePermissions.Series = data.dataValues.Series;
        console.log("User (action)  : Create New [DocTypePermissions]  By : {" + request.userName + "} , Date:" + Date());

        response.status(201).send(data);
        this.io
          .to(request.UserSeries)
          .emit("Add", { doctype: "DocTypePermissions", data: data });

      }).catch((err) => {
        if (err.name == "SequelizeForeignKeyConstraintError") {
          response.status(400).send({ message: "error in forign key (RoleSeries) || should be exist ." });
        }
        else {
          response.status(400).send({ message: err.name || "There is some Error in creating DocTypePermissions" });
        }
      })


    } catch (error) {
      next(new AddingRowException(error, "DocTypePermissions"));
      return;
    }

    next();
  };
  deleteDocTypePermissions = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const DocTypePermissionsReq = request.params;
    const { DocTypePermissions } = request.db.models;
    let result;
    try {
      // const oldDocTypePermissions = await DocTypePermissions.findOne({
      //   where: { Series: DocTypePermissionsReq.series },
      //   attributes: ["Series", "RoleSeries", "DocTypeID", "Read", "Write", "Create", "Delete"],
      // }).catch((err: any) => {
      //   response.status(400).send({
      //     message:
      //       err.name || "Some error occurred while finding old DocTypePermissions ."
      //   })
      // });

      await DocTypePermissions.destroy({
        where: {
          Series: DocTypePermissionsReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {
          console.log("User (action)  : Delete one [DocTypePermissions]  By : {" + request.userName + "} , Date:" + Date());

          response.send({
            message: "DocTypePermissions was deleted successfully!"
          });
        } else {
          return response.send({
            message: `Cannot delete DocTypePermissions with Series=${DocTypePermissionsReq.series}. Maybe DocTypePermissions was not found!`
          });
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while deleting DocTypePermissions."
        })
      })

      this.io
        .to(request.UserSeries)
        .emit("Delete", { doctype: "DocTypePermissions", data: DocTypePermissionsReq });

      next();

    } catch (error) {
      response.status(400).send({
        message:
          error.message || "Some error occurred while Deleting the DocTypePermissions."
      });

    }


    next();
  };
}

export default DocTypePermissionsController;
