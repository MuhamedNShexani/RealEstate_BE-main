import * as express from "express";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import authMiddleware from "../../middleware/auth.middleware";
class ReportsController extends BaseController {
  public read1 = "/Reports/PayMonthly/";
  
  public Write1 = "/Reports/PayMonthly/?:ContractStart&:ContractEnds";
  public read2 = "/Reports/OwnerProp";
  public read3 = "/Reports/getExtraPayemnts";
  public read4 = "/ActivityLog/";
  public read5 = "/Reports/Tenants";
  public read6 = "/Reports/collectionInsurance";
  public Write6 = "/Reports/collectionInsurance/:ContractStart&:ContractEnds";
  public io;
  public router = express.Router();
  public Reports: any; //new Reports();
  public DOCTYPE = ["DT-1"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.read1, authMiddleware, async (req, res, next) => {
      try {
        this.getReportPayMonthly(req, res, next)

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
  
    this.router.get(this.read2, authMiddleware, async (req, res, next) => {
      try {
        this.getReportOwnerProperty(req, res, next)

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
    this.router.get(this.read3, authMiddleware, async (req, res, next) => {
      try {
        this.getExtraPayemnt(req, res, next)

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
    this.router.get(this.read4, authMiddleware, async (req, res, next) => {
      try {
        this.getActivityLog(req, res, next)

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
    this.router.get(this.read5, authMiddleware, async (req, res, next) => {
      try {
        this.getTenant(req, res, next)

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
    this.router.get(this.read6, authMiddleware, async (req, res, next) => {
      try {
        this.getcollectionInsurance(req, res, next)

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

  getReportPayMonthly = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
   
    var config = require('../../db/config.ts');
    const sql = require('mssql');
    try {
      
      let pool = await sql.connect(config);
      let products;
      if(request.query.ContractStarts !=undefined && request.query.ContractEnds!=undefined){
       products = await pool.request().query("p_name  "+`'${request.query.ContractStarts}','${request.query.ContractEnds}'`);
      }else{
       products = await pool.request().query("p_name1");
      }
      response.status(200).send(products.recordsets[0])

    } catch (error) {
      console.log(error)
      response.send(error)
    }
  }

  getReportOwnerProperty = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    var config = require('../../db/config.ts');
    const sql = require('mssql');

    try {
      let pool = await sql.connect(config);
      let products = await pool.request().query("p_ownerProp");
      response.status(200).send(products.recordsets[0])

    } catch (error) {
      console.log(error)
      response.send(error)
    }
  }
  getExtraPayemnt = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    // var  config = require('../../db/config.ts');
    // const  sql = require('mssql');

    try {
      const { page, pageSize, filters } = request.query;
      const { Contracts,Purpose,Currency } = request.db.models;
      let i;
      let j;
      let data: any = [];
      const res = await Contracts.findAll({
        where: { ...filters },
        attributes: [
          "ID","Series", "ContractDate", "FirstParty", "SecondParty", "Property", "IsSale", "IsRent", "ContractStarts", "ContractEnds", "HandoverDate", "RequestedAmt", "PaidAmt", "PaidCurrency", "RentFor","ContractType",
          "RentCurrency", "AdvanceAmt", "AdvanceCurrency", "InsuranceAmt", "InsuranceCurrency", "IsFurnished", "Furnitures", "Remarks", "ExtraPayment", "Lawyer"]
        ,offset: parseInt(page) * parseInt(pageSize),
        limit: parseInt(pageSize),
      })
      for(i in res){  
        if(JSON.parse(res[i].ExtraPayment)!=null)      
     data.push(JSON.parse(res[i].ExtraPayment))
      }
    
if(data=='[]'){
  response.status(200).send(data)
}    else{
  let data2:any=[]
  for (i in data){
    for(j in data[i]){
    data2.push(data[i][j])

    }        
  }
for (i in data2)
{
  data2[i].id=undefined
   let result=await Purpose.findOne({
    where: { Series: data2[i].Purpose },
    // attributes: ["Series", "Purpose", "IsPayable", "DefaultAmt", "DefaultCurrency"],
  }).catch((err: any) => {
    response.status(400).send({
      message:
        err.name || "Some error occurred while find one Purpose."
    })
  });
  console.log(data2);
  
  let result1=await Currency.findOne({
    where: { Series: data2[i].PaidCurrency },
    // attributes: ["Series", "Purpose", "IsPayable", "DefaultAmt", "DefaultCurrency"],
  }).catch((err: any) => {
    response.status(400).send({
      message:
        err.name || "Some error occurred while find one Purpose."
    })
  });
if(result.dataValues.Purpose !=undefined){
    data2[i].Purpose=result.dataValues.Purpose
}
if(result1.dataValues.CurrencyName !=undefined){
  data2[i].PaidCurrency=result1.dataValues.CurrencyName
}
}
  response.status(200).send(data2)
}
    } catch (error) {
      console.log(error)
      response.send(error)
    }
  }
  getActivityLog = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    var config = require('../../db/config.ts');
    const sql = require('mssql');

    try {
      let pool = await sql.connect(config);
      let products = await pool.request().query("AG");
      response.status(200).send(products.recordsets[0])

    } catch (error) {
      console.log(error)
      response.send(error)
    }
  }
  getTenant = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    var config = require('../../db/config.ts');
    const sql = require('mssql');

    try {
      let pool = await sql.connect(config);
      let products = await pool.request().query("Tenant");
      response.status(200).send(products.recordsets[0])

    } catch (error) {
      console.log(error)
      response.send(error)
    }
  }
  getcollectionInsurance = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    var config = require('../../db/config.ts');
    const sql = require('mssql');

    try {
      let pool = await sql.connect(config);
      let products
      if(request.query.ContractStarts !=undefined && request.query.ContractEnds!=undefined){
       products = await pool.request().query("collection_insuranceFilter  "+`'${request.query.ContractStarts}','${request.query.ContractEnds}'`);
      }else{
        products = await pool.request().query("collection_insurance");
      }
      response.status(200).send(products.recordsets[0])

    } catch (error) {
      console.log(error)
      response.send(error)
    }
  }

}

export default ReportsController;
