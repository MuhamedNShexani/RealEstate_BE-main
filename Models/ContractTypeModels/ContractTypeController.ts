import * as express from "express";
import CreateContractType from "./CreateContractType.dto";
import validationMiddleware from "../../middleware/validation.middleware";

import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";
//import permissionsMiddleware from "../../middleware/permissions.middleware";

class ContractTypeController extends BaseController {
  public get = "/ContractType/:series";
  public read = "/ContractType/";
  public delete = "/ContractType/:series";
  public Update = "/ContractType/:series";
  public create = "/ContractType/";
  public io;

  public router = express.Router();
  public ContractType: any; //new ContractType();
  public DOCTYPE = ["DT-4"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getContractTypeBySeries(req, res, next)

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
        this.getAllContractType(req, res, next)

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
    this.router.put(this.Update, authMiddleware, validationMiddleware(CreateContractType),
      async (req, res, next) => {
        try {
          this.UpdateContractType(req, res, next)

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
      validationMiddleware(CreateContractType),
      async (req, res, next) => {
        try {
          this.createContractType(req, res, next)

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
        this.deleteContractType(req, res, next)

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

  private getContractTypeBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { ContractType } = request.db.models;

    let ContractTypeResult = await ContractType.findOne({
      where: { Series: series },
      // attributes: ["Series", "ContractType"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while find one ContractType."
      })
    });

    if (!ContractTypeResult) {
      next(new NotFoundException(series, "ContractType"));
      return;
    }
    console.log("User (action)  : get By Series [ContractType] By : {" + request.userName + "} , Date: " + Date());

    response.send(ContractTypeResult);
  };

  getAllContractType = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { ContractType } = request.db.models;

    try {
      const res = await ContractType.findAll({
        where: { ...filters },
        order: [["id", "DESC"]],

        // attributes: ["Series", "ContractType"],
        offset: parseInt(page) * parseInt(pageSize),
        limit: parseInt(pageSize),
      }).then(data => {
        if (data.length == 0) {
          console.log({ message: " there is no data ... in tbl ContractType" });
          response.send(data);
        }
        else {
          console.log("User (action)  : getAll [ContractType]  By : {" + request.userName + "} , Date:" + Date());

          response.send(data);
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while finding All ContractType."
        })
      });

    } catch (error) {
      console.log(error)
      response.send(error)

    }



  };

  UpdateContractType = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const ContractTypeUpdate: CreateContractType = request.body;
    const { ContractType } = request.db.models;

    let series = request.params.series;
    let result;
    try {
      let oldContractType = await ContractType.findOne({
        where: {
          Series: series,
        },
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while creating ContractType."
        })
      });

      result = await ContractType.update(
        {
          ...ContractTypeUpdate,
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
          console.log("User (action)  : Update [ContractType] By : {" + request.userName + "} , Date:" + Date());

          response.status(201).send("updated");
          this.io
            .to(request.UserSeries)
            .emit("Update", { doctype: "ContractType", data: ContractTypeUpdate });
        }
        else {
          response.status(404).send(series + "   Not found");
        }
      }).catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: " (ContractType) name has already used . please try another ." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating ContractType" });
      })


    }
    catch (error) {
      next(new AddingRowException(error, "ContractType"));

      return;
    }

    next();
  };
  createContractType = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const ContractTypeCreate: CreateContractType = request.body;
    const { ContractType } = request.db.models;
    let lastSeries;

    await ContractType.findOne({
      order: [["id", "DESC"]],
    }).
      then((data: any) => {
        if (!data) {
          lastSeries = 1;
        } else {
          lastSeries = +data.dataValues.Series.substring(6) + 1;
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while retrieving ContractType."
        })
      });

    let result;
    try {

      result = await ContractType.create({
        ...ContractTypeCreate,
        Series: "CTYPE-" + lastSeries,
        createdBy: request.userName,
        createdAt: new Date(),
      }).then(data => {

        ContractType.Series = data.dataValues.Series;
        console.log("User (action)  : Create New [ContractType] By : {" + request.userName + "} , Date: " + Date());
        this.io
        .to(request.UserSeries)
        .emit("Add", { doctype: "ContractType", data: data });

        response.status(201).send(data);



      }).catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: " (ContractType) name has already used . please try another ." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating ContractType" });
      })


    } catch (error) {
      next(new AddingRowException(error, "ContractType"));
      return;
    }

    next();
  };


  deleteContractType = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const ContractTypeReq = request.params;
    const { ContractType,CurrentUser } = request.db.models;
    let result;
    try {
      // const oldContractType = await ContractType.findOne({
      //   where: { Series: ContractTypeReq.series },
      //   attributes: ["Series", "ContractType"],
      // }).catch((err: any) => {
      //   response.status(400).send({
      //     message:
      //       err.name || "Some error occurred while finding old ContractType."
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
      await ContractType.destroy({
        where: {
          Series: ContractTypeReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {
          console.log("User (action)  : Delete one [ContractType] By : {" + request.userName + "} , Date: " + Date());

          return response.status(200).send({
            message: "ContractType was deleted successfully!"
          });
        } else {
          return response.status(503).send({
            message: `Cannot delete ContractType with Series=${ContractTypeReq.series}. Maybe ContractType was not found!`
          });
        }

      }).catch((err: any) => {
        response.status(404).send({
          message:
            err.name || "Some error occurred while deleting ContractType."
        })
      })
      this.io
        .to(request.UserSeries)
        .emit("Delete", { doctype: "ContractType", data: ContractTypeReq });
      next();


    } catch (error) {
      response.status(400).send({
        message:
          error.message || "Some error occurred while Deleting the ContractType."
      });

    }



    next();
  };
}

export default ContractTypeController;
