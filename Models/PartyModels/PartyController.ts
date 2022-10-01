import * as express from "express";
import CreateParty from "./CreateParty.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";

class PartyController extends BaseController {
  public get = "/Party/:series";
  public read = "/Party/";
  public delete = "/Party/:series";
  public Update = "/Party/:series";
  public create = "/Party/";
  public io;

  public router = express.Router();
  public Party: any; //new Party();
  public DOCTYPE = ["DT-5"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getPartyBySeries(req, res, next)

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
        this.getAllParty(req, res, next)

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
    this.router.put(this.Update, authMiddleware, validationMiddleware(CreateParty),
      async (req, res, next) => {
        try {
          this.UpdateParty(req, res, next)

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
      validationMiddleware(CreateParty),
      async (req, res, next) => {
        try {
          this.createParty(req, res, next)

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
        this.deleteParty(req, res, next)

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

  private getPartyBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { Party } = request.db.models;

    let PartyResult = await Party.findOne({
      where: { Series: series },
      // attributes: ["Series", "FullName", "Phone", "Cell", "Address", "Gender", "Remarks"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while findOne Party."
      })
    });

    if (!PartyResult) {
      next(new NotFoundException(series, "Party"));
      return;
    }
    console.log("User (action)  : get By Series [Party]  By : {" + request.userName + "} , Date:" + Date());

    response.send(PartyResult);
  };

  getAllParty = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { Party } = request.db.models;

    try {
      const res = await Party.findAll({
        where: { ...filters },
        // attributes: ["Series", "FullName", "Phone", "Cell", "Address", "Gender", "Remarks"] , 
        offset: parseInt(page) * parseInt(pageSize),
        limit: parseInt(pageSize),
      }).then(data => {
        if (data.length == 0) {
          console.log({ message: " there is no data ... in tbl Party" });
          response.send(data);
        }
        else {
          console.log("User (action)  : getAll [Party]  By : {" + request.userName + "} , Date:" + Date());

          response.send(data);
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while getAll Party."
        })
      });
    } catch (error) {
      console.log(error)
      response.send(error)
    }




  };

  UpdateParty = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const PartyUpdate: CreateParty = request.body;
    const { Party } = request.db.models;

    let series = request.params.series;
    let result;
    try {
      let oldParty = await Party.findOne({
        where: {
          Series: series,
        },
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while creating Party."
        })
      });

      result = await Party.update(
        {
          ...PartyUpdate,
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
          console.log("User (action)  : Update [Party]  By : {" + request.userName + "} , Date:" + Date());

          response.status(201).send("updated");
          this.io
            .to(request.UserSeries)
            .emit("Update", { doctype: "Party", data: PartyUpdate });
        }

        else {
          response.status(404).send("Series " + series + " Not found")
        }
      }
      ).catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: " (FullName)  has already used . please try another name ." });
        } else
          response.status(400).send({ message: err.name || "There is some Error in creating Party" });
      })

    }
    catch (error) {
      next(new AddingRowException(error, "Party"));

      return;
    }

    next();
  };
  createParty = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const PartyCreate: CreateParty = request.body;
    const { Party } = request.db.models;
    let lastSeries;

    await Party.findOne({

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
            err.name || "Some error occurred while retrieving Party."
        })
      });

    let result;
    try {

      result = await Party.create({
        ...PartyCreate,
        Series: "PAR-" + lastSeries,
        createdBy: request.userName,
        createdAt: new Date(),
      }).then(data => {
        Party.Series = data.dataValues.Series;
        console.log("User (action)  : Create New [Party] By : {" + request.userName + "} , Date: " + Date());

        response.status(201).send(data);

        this.io
          .to(request.UserSeries)
          .emit("Add", { doctype: "Party", data: data });


      }).catch((err) => {
        console.log(err);
        
        if (err.name == "SequelizeUniqueConstraintError") {
          response.status(400).send({ message: " (FullName)  has already used . please try another name ." });
        }
        else {
          response.status(400).send({ message: err.name || "there is an error while creating party" });
        }
      })

    } catch (error) {
      next(new AddingRowException(error, "Party"));
      return;
    }

    next();
  };

  deleteParty = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const PartyReq = request.params;
    const { Party,CurrentUser } = request.db.models;
    let result;
    try {
      // const oldParty = await Party.findOne({
      //   where: { Series: PartyReq.series },
      //   attributes: ["Series", "FullName", "Phone", "Cell", "Address", "Gender", "Remarks"],
      // }).catch((err: any) => {
      //   response.status(400).send({
      //     message:
      //       err.name || "Some error occurred while find old Party."
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
      await Party.destroy({
        where: {
          Series: PartyReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {
          console.log("User (action)  : Delete one [Party] By : {" + request.userName + "} , Date: " + Date());

          response.send({
            message: "Party was deleted successfully!"
          });
        } else {
          return response.send({
            message: `Cannot delete Party with Series=${PartyReq.series}. Maybe Party was not found!`
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
            err.name || "Some error occurred while deleting Party."
        })}
      });
      this.io
        .to(request.UserSeries)
        .emit("Delete", { doctype: "Party", data: PartyReq });

      next();
    } catch (error) {
      
      response.status(400).send({
        message:
          error.message || "Some error occurred while Deleting the Party."
      });

    }


    next();
  };
}

export default PartyController;
