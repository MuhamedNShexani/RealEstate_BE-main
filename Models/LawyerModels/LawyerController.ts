import * as express from "express";
import CreateLawyer from "./CreateLawyer.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";

class LawyerController extends BaseController {
  public get = "/Lawyer/:series";
  public read = "/Lawyer/";
  public delete = "/Lawyer/:series";
  public Update = "/Lawyer/:series";
  public create = "/Lawyer/";
  public io;

  public router = express.Router();
  public Lawyer: any; //new Lawyer();
  public DOCTYPE = ["DT-5"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getLawyerBySeries(req, res, next)

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
        this.getAllLawyer(req, res, next)

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
    this.router.put(this.Update, authMiddleware, validationMiddleware(CreateLawyer),
      async (req, res, next) => {
        try {
          this.UpdateLawyer(req, res, next)

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
      validationMiddleware(CreateLawyer),
      async (req, res, next) => {
        try {
          this.createLawyer(req, res, next)

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
        this.deleteLawyer(req, res, next)

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

  private getLawyerBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { Lawyer } = request.db.models;

    let LawyerResult = await Lawyer.findOne({
      where: { Series: series },
      // attributes: ["Series", "FullName", "Phone", "Cell", "Address", "Gender", "Remarks"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while findOne Lawyer."
      })
    });

    if (!LawyerResult) {
      next(new NotFoundException(series, "Lawyer"));
      return;
    }
    console.log("User (action)  : get By Series [Lawyer]  By : {" + request.userName + "} , Date:" + Date());

    response.send(LawyerResult);
  };

  getAllLawyer = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { Lawyer } = request.db.models;

    try {
      const res = await Lawyer.findAll({
        where: { ...filters },
        // attributes: ["Series", "FullName", "Phone", "Cell", "Address", "Gender", "Remarks"] , 
        offset: parseInt(page) * parseInt(pageSize),
        limit: parseInt(pageSize),
      }).then(data => {
        if (data.length == 0) {
          console.log({ message: " there is no data ... in tbl Lawyer" });
          response.send(data);
        }
        else {
          console.log("User (action)  : getAll [Lawyer]  By : {" + request.userName + "} , Date:" + Date());

          response.send(data);
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while getAll Lawyer."
        })
      });
    } catch (error) {
      console.log(error)
      response.send(error)
    }




  };

  UpdateLawyer = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const LawyerUpdate: CreateLawyer = request.body;
    const { Lawyer } = request.db.models;

    let series = request.params.series;
    let result;
    try {
      let oldLawyer = await Lawyer.findOne({
        where: {
          Series: series,
        },
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while creating Lawyer."
        })
      });

      result = await Lawyer.update(
        {
          ...LawyerUpdate,
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
          console.log("User (action)  : Update [Lawyer]  By : {" + request.userName + "} , Date:" + Date());

          response.status(201).send("updated");
          this.io
            .to(request.UserSeries)
            .emit("Update", { doctype: "Lawyer", data: LawyerUpdate });
        }

        else {
          response.status(404).send("Series " + series + " Not found")
        }
      }
      ).catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: " (FullName)  has already used . please try another name ." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating Lawyer" });
      })

    }
    catch (error) {
      next(new AddingRowException(error, "Lawyer"));

      return;
    }

    next();
  };
  createLawyer = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const LawyerCreate: CreateLawyer = request.body;
    const { Lawyer } = request.db.models;
    let lastSeries;

    await Lawyer.findOne({

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
            err.name || "Some error occurred while retrieving Lawyer."
        })
      });

    let result;
    try {

      result = await Lawyer.create({
        ...LawyerCreate,
        Series: "LYR-" + lastSeries,
        createdBy: request.userName,
        createdAt: new Date(),
      }).then(data => {
        Lawyer.Series = data.dataValues.Series;
        console.log("User (action)  : Create New [Lawyer] By : {" + request.userName + "} , Date: " + Date());

        response.status(201).send(data);

        this.io
          .to(request.UserSeries)
          .emit("Add", { doctype: "Lawyer", data: data });


      }).catch((err) => {
        console.log(err);
        
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: " (FullName)  has already used . please try another name ." });
        }
        else {
          response.status(400).send({ message: err.name || "there is an error while creating Lawyer" });
        }
      })

    } catch (error) {
      next(new AddingRowException(error, "Lawyer"));
      return;
    }

    next();
  };

  deleteLawyer = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const LawyerReq = request.params;
    const { Lawyer,CurrentUser } = request.db.models;
    let result;
    try {
      // const oldLawyer = await Lawyer.findOne({
      //   where: { Series: LawyerReq.series },
      //   attributes: ["Series", "FullName", "Phone", "Cell", "Address", "Gender", "Remarks"],
      // }).catch((err: any) => {
      //   response.status(400).send({
      //     message:
      //       err.name || "Some error occurred while find old Lawyer."
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
      await Lawyer.destroy({
        where: {
          Series: LawyerReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {
          console.log("User (action)  : Delete one [Lawyer] By : {" + request.userName + "} , Date: " + Date());

          response.send({
            message: "Lawyer was deleted successfully!"
          });
        } else {
          return response.send({
            message: `Cannot delete Lawyer with Series=${LawyerReq.series}. Maybe Lawyer was not found!`
          })
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
            err.name || "Some error occurred while deleting Lawyer."
        })}
      });
      this.io
        .to(request.UserSeries)
        .emit("Delete", { doctype: "Lawyer", data: LawyerReq });

      next();
    } catch (error) {
      
      response.status(400).send({
        message:
          error.message || "Some error occurred while Deleting the Lawyer."
      });

    }


    next();
  };
}

export default LawyerController;
