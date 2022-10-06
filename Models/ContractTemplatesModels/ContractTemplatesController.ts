import * as express from "express";
import CreateContractTemplates from "./CreateContractTemplates.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";
//import permissionsMiddleware from "../../middleware/permissions.middleware";

class ContractTemplatesController extends BaseController {
  public get = "/ContractTemplates/:series";
  public read = "/ContractTemplates/";
  public delete = "/ContractTemplates/:series";
  public Update = "/ContractTemplates/:series";
  public create = "/ContractTemplates/";
  public io;

  public router = express.Router();
  public ContractTemplates: any; //new ContractTemplates();
  public DOCTYPE = ["DT-3"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getContractTemplatesBySeries(req, res, next)

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
        this.getAllContractTemplates(req, res, next)

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
    this.router.put(this.Update, authMiddleware, validationMiddleware(CreateContractTemplates),
      async (req, res, next) => {
        try {
          this.UpdateContractTemplates(req, res, next)

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
      validationMiddleware(CreateContractTemplates),
      async (req, res, next) => {
        try {
          this.CreateContractTemplates(req, res, next)

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
        this.deleteContractTemplates(req, res, next)

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

  private getContractTemplatesBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { ContractTemplates } = request.db.models;

    let ContractTemplatesResult = await ContractTemplates.findOne({
      where: { Series: series },
      // attributes: ["Series", "TemplateName", "DocType", "PrintFormat"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while find ContractTemplates."
      })
    });

    if (!ContractTemplatesResult) {
      next(new NotFoundException(series, "ContractTemplates"));
      return;
    }

    console.log("User (action)  : get By Series [ContractTemplates]  By : {" + request.userName + "} , Date:" + Date());

    response.send(ContractTemplatesResult);
  };

  getAllContractTemplates = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { ContractTemplates } = request.db.models;

    try {
      const res = await ContractTemplates.findAll({
        where: { ...filters },
        order: [["id", "DESC"]],

        // attributes: ["Series", "TemplateName", "DocType", "PrintFormat"],
        offset: parseInt(page) * parseInt(pageSize),
        limit: parseInt(pageSize),
      }).then(data => {
        if (data.length == 0) {
          console.log({ message: " there is no data ... in tbl ContractTemplates" });
          response.send(data);
        }
        else {
          console.log("User (action)  : getAll [ContractTemplates] By : {" + request.userName + "} , Date: " + Date());

          response.send(data);
        }
      }).catch((err: any) => {
        console.log(err);

        response.status(400).send({
          message:
            err.name || "Some error occurred while findAll ContractsTemplates."
        })
      });
    } catch (error) {
      console.log(error)
      response.send(error)

    }

  };

  UpdateContractTemplates = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const ContractTemplatesUpdate: CreateContractTemplates = request.body;
    const { ContractTemplates } = request.db.models;

    let series = request.params.series;
    let result;
    try {
      let oldCreateContractTemplates = await ContractTemplates.findOne({
        where: {
          Series: series,
        },
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while creating ContractTemplates."
        })
      });

      result = await ContractTemplates.update(
        {
          ...ContractTemplatesUpdate,
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
          console.log("User (action)  : Update [ContractTemplates]  By : {" + request.userName + "} , Date:" + Date());

          response.status(201).send("updated");
          this.io
            .to(request.UserSeries)
            .emit("Update", { doctype: "ContractTemplate", data: ContractTemplatesUpdate });


        }
        else {
          response.status(404).send(series + " Not found");
        }
      }).catch((err) => {
        console.log(err)
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: "TemplateName has already used . please try another name." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating ContractTemplates" });
      })
    }
    catch (error) {
      console.log(error)
      next(new AddingRowException(error, "UpdateContractTemplates"));

      return;
    }

    next();
  };
  CreateContractTemplates = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const ContractTemplatesCreate: CreateContractTemplates = request.body;
    const { ContractTemplates } = request.db.models;
    let lastSeries;

    await ContractTemplates.findOne({

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
            err.name || "Some error occurred while retrieving CreateContractTemplates."
        })
      });

    let result;
    try {

      // request.body.HTML=request.body.HTML.replaceAll("<", "&lt;");
      // request.body.HTML=request.body.HTML.replaceAll(">", "&gt;");

      result = await ContractTemplates.create({
        ...ContractTemplatesCreate,
        HTML: request.body.HTML,
        Series: "CTEMP-" + lastSeries,
        createdBy: request.userName,
        createdAt: new Date(),
      }).then(data => {
        ContractTemplates.Series = data.dataValues.Series;
        console.log("User (action)  : Create new [ContractTemplates]  By : {" + request.userName + "} , Date: " + Date());

        response.status(201).send(data);
        this.io
          .to(request.UserSeries)
          .emit("Add", { doctype: "ContractTemplate", data: data });


      }).catch((err) => {
        console.log(err)
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: "TemplateName has already used . please try another name." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating ContractTemplates" });
      })

    } catch (error) {
      console.log(error);

      next(new AddingRowException(error, "CreateContractTemplates"));
      return;
    }

    next();
  };

  deleteContractTemplates = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const ContractTemplatesReq = request.params;
    const { ContractTemplates, CurrentUser } = request.db.models;
    let result;
    try {
      // const oldContractTemplates = await ContractTemplates.findOne({
      //   where: { Series: ContractTemplatesReq.series },
      //   attributes: ["Series", "TemplateName", "DocType", "PrintFormat"],
      // }).catch((err: any) => {
      //   response.status(400).send({
      //     message:
      //       err.name || "Some error occurred while find old ContractTEmplates."
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
      await ContractTemplates.destroy({
        where: {
          Series: ContractTemplatesReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {
          console.log("User (action)  : Delete one [ContractTemplates]  By : {" + request.userName + "} , Date:" + Date());

          response.send({
            message: "ContractTemplates was deleted successfully!"
          });
        } else {
          return response.send({
            message: `Cannot delete ContractTemplates with Series=${ContractTemplatesReq.series}. Maybe ContractTemplates was not found!`
          });
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while deleting ContractTemplates."
        })
      })
      this.io
        .to(request.UserSeries)
        .emit("Delete", { doctype: "ContractTemplate", data: ContractTemplatesReq });
      next();

    } catch (error) {
      response.status(400).send({
        message:
          error.message || "Some error occurred while Deleting the ContractTemplates."
      });

    }



    next();
  };
}

export default ContractTemplatesController;
