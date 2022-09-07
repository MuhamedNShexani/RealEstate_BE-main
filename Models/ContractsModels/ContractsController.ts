import * as express from "express";
import CreateContracts from "./CreateContracts.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";
//import permissionsMiddleware from "../../middleware/permissions.middleware";

class ContractsController extends BaseController {
  public get = "/Contracts/:series";
  public read = "/Contracts/";
  public delete = "/Contracts/:series";
  public Update = "/Contracts/:series";
  public create = "/Contracts/";
  public io;

  public router = express.Router();
  public Contracts: any; //new Contracts();
  public DOCTYPE = ["DT-2"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getContractsBySeries(req, res, next)

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
        this.getAllContracts(req, res, next)

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
    this.router.put(this.Update, authMiddleware, validationMiddleware(CreateContracts),
      async (req, res, next) => {
        try {
          this.UpdateContracts(req, res, next)

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
      validationMiddleware(CreateContracts),
      async (req, res, next) => {
        try {
          this.createContracts(req, res, next)

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
        this.deleteContracts(req, res, next)

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

  private getContractsBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { Contracts } = request.db.models;

    let ContractsResult = await Contracts.findOne({
      where: { Series: series },
      // attributes: ["Series", "ContractDate", "FirstParty", "SecondParty", "Property", "IsSale", "IsRent", "ContractStarts", "ContractEnds", "HandoverDate", "RequestedAmt", "PaidAmt", "PaidCurrency", "RentFor",
      //   "RentCurrency", "AdvanceAmt", "AdvanceCurrency", "InsuranceAmt", "InsuranceCurrency", "IsFurnished", "Furnitures", "Remarks", "ExtraPayment", "Lawyer"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while get Contracts."
      })
    });;

    if (!ContractsResult) {
      next(new NotFoundException(series, "Contracts"));
      return;
    }
    console.log("User (action)  : get By Series [Contracts] By : {" + request.userName + "} , Date:" + Date());

    response.send(ContractsResult);
  };

  getAllContracts = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { Contracts } = request.db.models;

    try {
      const res = await Contracts.findAll({
        where: { ...filters },
        // attributes: ["Series", "ContractDate", "FirstParty", "SecondParty", "Property", "IsSale", "IsRent", "ContractStarts", "ContractEnds", "HandoverDate", "RequestedAmt", "PaidAmt", "PaidCurrency", "RentFor",
        //   "RentCurrency", "AdvanceAmt", "AdvanceCurrency", "InsuranceAmt", "InsuranceCurrency", "IsFurnished", "Furnitures", "Remarks", "ExtraPayment", "Lawyer"]
        offset: parseInt(page) * parseInt(pageSize),
        limit: parseInt(pageSize),
      }).then(data => {
        if (data.length == 0) {
          console.log({ message: " there is no data ... in tbl Contract" });
          response.send(data);
        }
        else {
          console.log("User (action)  : getAll [Contracts]  By : {" + request.userName + "} , Date: " + Date());

          response.send(data);
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while getAll Contracts."
        })
      });
    } catch (error) {
      console.log(error)
      response.send(error)
    }


  };

  UpdateContracts = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const ContractsUpdate: CreateContracts = request.body;
    const { Contracts, Property } = request.db.models;

    let series = request.params.series;
    let result;
    try {
      if (ContractsUpdate.IsRent == ContractsUpdate.IsSale)
        response.status(400).send({ message: " the property of contract should be for Rent Or for Sale check one of this two value" })

      // let oldContracts = await Contracts.findOne({

      //   where: {
      //     Series: series,
      //   },
      // }).catch((err: any) => {
      //   response.status(400).send({
      //     message:
      //       err.name || "Some error occurred while creating Contracts."
      //   })
      // });
      try {
        let owner = await Property.findOne({ where: { Series: ContractsUpdate.Property } })
        if (ContractsUpdate.FirstParty == null) {
          ContractsUpdate.FirstParty = owner.dataValues.Party

        } else if (ContractsUpdate.FirstParty != owner.dataValues.Party) {
          response.status(400).send({ message: "First Party must be owner" })

        }

      } catch (err) {
        response.status(400).send({ message: err.name })

      }

      result = await Contracts.update(
        {
          ...ContractsUpdate,
          Attributes:JSON.stringify(request.body.Attributes),
          Furnitures:JSON.stringify(request.body.Furnitures),
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
          response.status(201).send("updated");
          console.log("User (action)  : Update [Contracts]  By : {" + request.userName + "} , Date:" + Date());

          this.io
            .to(request.UserSeries)
            .emit("Update", { doctype: "Contracts", data: ContractsUpdate });

        } else {
          response.status(404).send(series + "  Not found");
        }
      }).catch((err) => {
        if (err.index != undefined)
          response.status(400).send({ message: "error in forign key " + err.index + " || should be exist ." });
        else {
          console.log(err);

          if (err.name == "SequelizeUniqueConstraintError") {
            response.status(400).send({ message: " [ContractsProperty] is unique || This property has been sold  " });
          } else
            response.status(400).send({ message: err || "There is some Error in creating User" });

        }
      })


    }
    catch (error) {
      next(new AddingRowException(error, "Contracts"));

      return;
    }

    next();
  };
  createContracts = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const ContractsCreate: CreateContracts = request.body;
    const { Contracts, Property } = request.db.models;
    let lastSeries;
    try {
      let owner = await Property.findOne({ where: { Series: ContractsCreate.Property } })
      if (ContractsCreate.FirstParty == null) {
        ContractsCreate.FirstParty = owner.dataValues.Party

      } else if (ContractsCreate.FirstParty != owner.dataValues.Party) {
        response.status(400).send({ message: "First Party must be owner" })

      }

    } catch (err) {
      response.status(400).send({ message: err.name })

    }

    if (ContractsCreate.IsRent == ContractsCreate.IsSale)
      response.status(400).send({ message: " the property of contract should be for Rent Or for Sale check one of this two value" })

    if (ContractsCreate.FirstParty == ContractsCreate.SecondParty) {
      response.status(400).send({ message: "[First Party] and [Second party] must be different  " })
    } else {
      await Contracts.findOne({
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
              err.name || "Some error occurred while retrieving Contracts."
          })
        });
      let result;
      try {
console.log(lastSeries);

        await Contracts.create({
          ...ContractsCreate,
          Attribute:JSON.stringify(request.body.Attribute),
          Furnitures:JSON.stringify(request.body.Furnitures),
          Series: "CON-" + lastSeries,
          createdBy: request.userName,
          createdAt: new Date(),
        }).then(async data => {
          Contracts.Series = data.dataValues.Series;
          // console.log(data.dataValues.SecondParty);

          console.log("User (action)  : Create new [Contracts] By : {" + request.userName + "} , Date: " + Date());
          await Property.update(
            {
              Party: data.dataValues.SecondParty,
              updatedBy: request.userName,
              updatedAt: new Date(),
            },
            {
              where: {
                Series: data.dataValues.Property,
              },
            }
          )
          response.status(201).send(data)

          this.io
            .to(request.UserSeries)
            .emit("Add", { doctype: "Contracts", data: data });


        }).catch((err) => {
          if (err.index != undefined)
            response.status(400).send({ message: "error in forign key " + err.index + " || should be exist ." });
          else {
            console.log(err);

            if (err.name == "SequelizeUniqueConstraintError") {
              response.status(400).send({ message: " [ContractsProperty] is unique   " });
            } else
              response.status(400).send({ message: err || "There is some Error in creating User" });

          }
        }
        )

      } catch (error) {
        next(new AddingRowException(error, "Contracts"));
        return;
      }
    }
    next();
  };


  deleteContracts = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const ContractsReq = request.params;
    const { Contracts } = request.db.models;
    let result;
    try {
      const oldContracts = await Contracts.findOne({
        where: { Series: ContractsReq.series },
        attributes: ["Series", "ContractDate", "FirstParty", "SecondParty", "Property", "IsSale", "IsRent", "ContractStarts", "ContractEnds", "HandoverDate", "RequestedAmt", "PaidAmt", "PaidCurrency", "RentFor",
          "RentCurrency", "AdvanceAmt", "InsuranceAmt", "AdvanceCurrency", "InsuranceAmt", "InsuranceCurrency", "IsFurnished", "Furnitures", "Remarks", "ExtraPayment", "Lawyer"],
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while find old Contracts."
        })
      });
      await Contracts.destroy({
        where: {
          Series: ContractsReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {
          console.log("User (action)  : delete one [Contracts]  By : {" + request.userName + "} , Date:" + Date());
          this.io
            .to(request.UserSeries)
            .emit("Delete", { doctype: "Contracts", data: ContractsReq });

          return response.send({
            message: "Contracts was deleted successfully!"
          })
        } else {
          return response.send({
            message: `Cannot delete Contracts with Series=${ContractsReq.series}. Maybe Contracts was not found!`
          });
        }
      }).catch((err: any) => {

        response.status(400).send({
          message:
            err.name || "Some error occurred while deleting Contracts."
        })
      });

      next();

    } catch (error) {
      response.status(400).send({
        message:
          error.name || "Some error occurred while Deleting the Contracts."
      });

    }


  }
}

export default ContractsController;
