import * as express from "express";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import authMiddleware from "../../middleware/auth.middleware";
class ReportsController extends BaseController {
  public read1 = "/Reports/PayMonthly";
  public read2 = "/Reports/OwnerProp";
  public read3 = "/Reports/getExtraPayemnts/";
  public read4 = "/ActivityLog/";
  public read5 = "/Reports/Tenants";
  public read6 = "/Reports/collectionInsurance";
  public read7 = "/Reports/Lawyer_Report";

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
    this.router.get(this.read7, authMiddleware, async (req, res, next) => {
      try {
        this.getLawyerReport(req, res, next)

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
      let products;
      if(request.query.Phone !=undefined && request.query.Party !=undefined){
        products = await pool.request().query("p_ownerPropFilters  "+`'${request.query.Party}','${request.query.Phone}'`);
       }else
      if(request.query.Party !=undefined ){
       products = await pool.request().query("p_ownerPropFilters  "+`'${request.query.Party}',''`);
      }else 
        if(request.query.Phone !=undefined ){
          products = await pool.request().query("p_ownerPropFilters  "+`'','${request.query.Phone}'`);
         }
      else 
      {
       products = await pool.request().query("p_ownerProp");
      }
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
          "ID","Series", "ContractDate", "FirstParty", "SecondParty", "Property", "TypeOfTran", "ContractStarts", "ContractEnds", "HandoverDate", "RequestedAmt", "PaidAmt", "PaidCurrency", "RentFor","ContractType",
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
  let data3:any=[]
  for (i in data){
    for(j in data[i]){
    data2.push(data[i][j])

    }        
  }
  data3={...data2};
  
if(request.query.Purpose !=undefined ){
  for (i in data3)
{    
  data3[i].id=undefined
  if(data3[i].Purpose==request.query.Purpose){  
      
    let result=await Purpose.findOne({
      where: { Series: data3[i].Purpose },
      // attributes: ["Series", "Purpose", "IsPayable", "DefaultAmt", "DefaultCurrency"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while find one Purpose."
      })
    });  
    let result1=await Currency.findOne({
      where: { Series: data3[i].PaidCurrency },
      // attributes: ["Series", "Purpose", "IsPayable", "DefaultAmt", "DefaultCurrency"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while find one Purpose."
      })
    });
  if(result.dataValues.Purpose !=undefined){
      data3[i].Purpose=result.dataValues.Purpose
  }
  if(result1.dataValues.CurrencyName !=undefined){
    data3[i].PaidCurrency=result1.dataValues.CurrencyName
  }
  }
  else{
    data2 = data2.filter(function(item) {
      return item.Purpose !== data3[i].Purpose
  })
  }
}
response.status(200).send(data2)
}
else
if(request.query.ContractDate !=undefined ){
  for (i in data3)
{    
  data3[i].id=undefined
  if(data3[i].ContractDate==request.query.ContractDate){  
      
    let result=await Purpose.findOne({
      where: { Series: data3[i].Purpose },
      // attributes: ["Series", "Purpose", "IsPayable", "DefaultAmt", "DefaultCurrency"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while find one Purpose."
      })
    });  
    let result1=await Currency.findOne({
      where: { Series: data3[i].PaidCurrency },
      // attributes: ["Series", "Purpose", "IsPayable", "DefaultAmt", "DefaultCurrency"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while find one Purpose."
      })
    });
  if(result.dataValues.Purpose !=undefined){
      data3[i].Purpose=result.dataValues.Purpose
  }
  if(result1.dataValues.CurrencyName !=undefined){
    data3[i].PaidCurrency=result1.dataValues.CurrencyName
  }
  }
  else{
    data2 = data2.filter(function(item) {
      return item.ContractDate !== data3[i].ContractDate
  })
  }
}
response.status(200).send(data2)
}
else
{
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
}}catch (error) {
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
      console.log(request.query);

      if(request.query.ActionType==undefined){
        request.query.ActionType=99
      }
      if(request.query.Doctype==0){
        request.query.Doctype=''
      }
      if(request.query.User==0){
        request.query.User=''
      }
      let products;
      if(request.query.ContractStarts !=undefined
         && request.query.ContractEnds!=undefined
         && request.query.ActionType!=undefined
         && request.query.User!=undefined 
         && request.query.Doctype!=undefined ) {
        products = await pool.request()
        .query("AGFilter  "+`${request.query.ActionType},'${request.query.User}','${request.query.ContractStarts}','${request.query.ContractEnds}','${request.query.Doctype}'`);
       }else{
        products = await pool.request().query("AG");
       }      
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
      let products
      if(request.query.Property !=undefined && request.query.Lawyer !=undefined){
        products = await pool.request().query("TenantFilter  "+`'${request.query.Lawyer}','${request.query.Property}'`);
       }else
      if(request.query.Lawyer !=undefined ){
       products = await pool.request().query("TenantFilter  "+`'${request.query.Lawyer}',''`);
      }else 
        if(request.query.Property !=undefined ){
          products = await pool.request().query("TenantFilter  "+`'','${request.query.Property}'`);
         }
      else 
      {
       products = await pool.request().query("Tenant");
      }

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
  getLawyerReport = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    var config = require('../../db/config.ts');
    const sql = require('mssql');

    try {
      let pool = await sql.connect(config);
      let products
      if(request.query.Phone !=undefined && request.query.Lawyer !=undefined){
        products = await pool.request().query("lawyerReportFilter  "+`'${request.query.Lawyer}','${request.query.Phone}'`);
       }else
      if(request.query.Lawyer !=undefined ){
       products = await pool.request().query("lawyerReportFilter  "+`'${request.query.Lawyer}',''`);
      }else 
        if(request.query.Phone !=undefined ){
          products = await pool.request().query("lawyerReportFilter  "+`'','${request.query.Phone}'`);
         }
      else 
      {
       products = await pool.request().query("lawyerReport");
      }
      response.status(200).send(products.recordsets[0])

    } catch (error) {
      console.log(error)
      response.send(error)
    }
  }

}

export default ReportsController;
