import * as express from "express";
import CreatePayments from "./CreatePayments.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";

class PaymentsController extends BaseController {
  public get = "/Payments/:series";
  public read = "/Payments/";
  public delete = "/Payments/:series";
  public Update = "/Payments/:series";
  public create = "/Payments/";
  public io;

  public router = express.Router();
  public Payments: any; //new Payments();
  public DOCTYPE = ["DT-6"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getPaymentsBySeries(req, res, next)

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
        this.getAllPayments(req, res, next)

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
    this.router.put(this.Update, authMiddleware, validationMiddleware(CreatePayments),
      async (req, res, next) => {
        try {
          this.UpdatePayments(req, res, next)

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
      validationMiddleware(CreatePayments),
      async (req, res, next) => {
        try {
          this.createPayments(req, res, next)

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
        this.deletePayments(req, res, next)

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

  private getPaymentsBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { Payments } = request.db.models;

    let PaymentsResult = await Payments.findOne({
      where: { Series: series },
      // attributes: ["Series", "PostingDate", "Reference", "Purpose", "Amount", "Currency", "For", "Remarks"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while finding one Payemnt."
      })
    });

    if (!PaymentsResult) {
      next(new NotFoundException(series, "Payments"));
      return;
    }
    console.log("User (action)  : get By Series[Payments]  By : {" + request.userName + "} , Date:" + Date());

    response.send(PaymentsResult);
  };

  getAllPayments = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { Payments } = request.db.models;

    try {
      const res = await Payments.findAll({
        where: { ...filters },
        order: [["id", "DESC"]],
        // attributes: ["Series", "PostingDate", "Reference", "Purpose", "Amount", "Currency", "For", "Remarks"],
        offset: parseInt(page) * parseInt(pageSize),
        limit: parseInt(pageSize),
      }).then(data => {
        if (data.length == 0) {
          console.log({ message: " there is no data ... in tbl Payments" });
          response.send(data);
        }
        else {
          console.log("User (action)  : getAll [Payments]  By : {" + request.userName + "} , Date:" + Date());

          response.send(data);
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while find all payments."
        })
      });

    } catch (error) {
      console.log(error)
      response.send(error)
    }



  };

  UpdatePayments = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const PaymentsUpdate: CreatePayments = request.body;
    const { Payments, Contracts } = request.db.models;

    let series = request.params.series;
    let result;
    try {
      // let oldPayments = await Payments.findOne({

      //   where: {
      //     Series: series,
      //   },
      // }).catch((err: any) => {
      //   response.status(400).send({
      //     message:
      //       err.name || "Some error occurred while creating Payments."
      //   })
      // });
      try {
        let owner = await Contracts.findOne({ where: { series: PaymentsUpdate.Reference } })
        if (PaymentsUpdate.ReceiveParty != null || PaymentsUpdate.PayParty != null) {
          if (PaymentsUpdate.ReceiveParty == PaymentsUpdate.PayParty)
            response.status(400).send({ message: "Receive Party AND Pay Party must be deffrent" })
          //  else if(PaymentsCreate.PayParty!=owner.dataValues.SecondParty || PaymentsCreate.PayParty!=owner.dataValues.FirstParty)
          //  {
          //   response.status(400).send({ message:"Pay Party must be second party of contract"})
          //  }
        }
      } catch (error) {
        response.status(400).send({ message: "REFERENCE not exist" })

      }
      result = await Payments.update(
        {
          ...PaymentsUpdate,
          updatedBy: request.userName,
          updatedAt: new Date(),
        },
        {
          where: {
            Series: series,
          },
        }
      ).then((data: any) => {
        if (data[0] == 1) {
          console.log("User (action)  : Update [Payments]  By : {" + request.userName + "} , Date:" + Date());

          response.status(201).send("updated");
          this.io
            .to(request.UserSeries)
            .emit("Update", { doctype: "Payments", data: PaymentsUpdate });

        }
        else {
          response.status(404).send("Series " + series + " Not found")
        }
      }).catch((err: any) => {
        if (err.index != undefined)
          response.status(400).send({ message: "error in forign key " + err.index + " || should be exist ." });
        else {
          response.status(400).send({ message: err.name || "There is some Error in creating Payments" });
        }
      });

    }
    catch (error) {
      next(new AddingRowException(error, "Payments"));

      return;
    }

    next();
  };
  createPayments = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const PaymentsCreate: CreatePayments = request.body;
    const { Payments, Contracts } = request.db.models;
    let lastSeries;

    await Payments.findOne({
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
            err.name || "Some error occurred while retrieving Payments."
        })
      });
    let result;
    try {
      let owner = await Contracts.findOne({ where: { series: PaymentsCreate.Reference } })
      if (PaymentsCreate.ReceiveParty != null || PaymentsCreate.PayParty != null) {
        if (PaymentsCreate.ReceiveParty == PaymentsCreate.PayParty)
          response.status(400).send({ message: "Receive Party AND Pay Party must be deffrent" })
        //  else if(PaymentsCreate.PayParty!=owner.dataValues.SecondParty || PaymentsCreate.PayParty!=owner.dataValues.FirstParty)
        //  {
        //   response.status(400).send({ message:"Pay Party must be second party of contract"})
        //  }
      }
    } catch (error) {
      response.status(400).send({ message: "REFERENCE not exist" })

    }

    try {

      result = await Payments.create({
        ...PaymentsCreate,
        Series: "PAY-" + lastSeries,
        createdBy: request.userName,
        createdAt: new Date(),
      }).then((data: any) => {
        Payments.Series = data.dataValues.Series;

        console.log("User (action)  : Create New [Payments]  By : {" + request.userName + "} , Date:" + Date());

        response.status(201).send(data)
        this.io
          .to(request.UserSeries)
          .emit("Add", { doctype: "Payments", data: data });

      }).catch((err: any) => {
        if (err.index != undefined)
          response.status(400).send({ message: "error in forign key " + err.index + " || should be exist ." });
        else {
          response.status(400).send({ message: err.name || "There is some Error in creating Payments" });
        }
      });


    } catch (error) {
      next(new AddingRowException(error, "Payments"));
      return;
    }

    next();
  };

  deletePayments = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const PaymentsReq = request.params;
    const { Payments, CurrentUser } = request.db.models;
    let result;
    try {
      // const oldPayments = await Payments.findOne({
      //   where: { Series: PaymentsReq.series },
      //   attributes: ["Series", "PostingDate", "Reference", "Purpose", "Amount", "Currency", "For", "Remarks"],
      // }).catch((err: any) => {
      //   response.status(400).send({
      //     message:
      //       err.name || "Some error occurred while finding old Payments."
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
      await Payments.destroy({
        where: {
          Series: PaymentsReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {
          console.log("User (action)  : Delete One [Payments]  By : {" + request.userName + "} , Date:" + Date());

          response.send({
            message: "Payments was deleted successfully!"
          });
        } else {
          return response.send({
            message: `Cannot delete Payments with Series=${PaymentsReq.series}. Maybe Payments was not found!`
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
              err.name || "Some error occurred while deleting Payments."
          })
        }
      })
      this.io
        .to(request.UserSeries)
        .emit("Delete", { doctype: "Payments", data: PaymentsReq });

      next();
    } catch (error) {
      response.status(400).send({
        message:
          error.message || "Some error occurred while Deleting the Payments."
      });

    }




    next();
  };
}

// currency exchange

// dinner:148000
// doller:100
// lira:255
//




export default PaymentsController;
