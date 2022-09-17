import * as express from "express";
import CreateBranches from "./CreateBranches.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";
import Permission from "../PermissionModels/Permission.model";
class BranchesController extends BaseController {
  public get = "/Branches/:series";
  public read = "/Branches/";
  public delete = "/Branches/:series";
  public Update = "/Branches/:series";
  public create = "/Branches/";
  public io;
  public router = express.Router();
  public Branches: any; //new Branches();
  public DOCTYPE = ["DT-1"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getBranchesBySeries(req, res, next)

        // Permission.findOne({
        //   where:{
        //     DocTypeID:this.DOCTYPE,
        //     RoleSeries:req.user.permissions
        //   }
        // }).then((data)=>{

        //   if(data?.Read){            
        //     this.getBranchesBySeries(req, res, next)
        //   }
        //   else{
        //     res.send({message:"You dont have permission to do that"})
        //   }

        // })

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
        this.getAllBranches(req, res, next)

        // Permission.findOne({
        //   where:{
        //     DocTypeID:this.DOCTYPE,
        //     RoleSeries:req.user.permissions
        //   }
        // }).then((data)=>{

        //   if(data?.Read){            
        //     this.getAllBranches(req, res, next)
        //   }
        //   else{
        //     res.send({message:"You dont have permission to do that"})
        //   }

        // })

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

    this.router.put(this.Update, authMiddleware, validationMiddleware(CreateBranches),
      async (req, res, next) => {
        try {
          this.UpdateBranches(req, res, next)

          // Permission.findOne({
          //   where:{
          //     DocTypeID:this.DOCTYPE,
          //     RoleSeries:req.user.permissions
          //   }
          // }).then((data)=>{

          //   if(data?.Write){            
          //     this.UpdateBranches(req, res, next)
          //   }
          //   else{
          //     res.send({message:"You dont have permission to do that"})
          //   }
          // })
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
      validationMiddleware(CreateBranches),
      async (req, res, next) => {
        try {
          this.createBranches(req, res, next)

          // console.log(req.user.permissions);
          // Permission.findOne({
          //   where:{
          //     DocTypeID:this.DOCTYPE,
          //     RoleSeries:req.user.permissions
          //   }
          // }).then((data)=>{

          //   if(data?.Create){            
          //     this.createBranches(req, res, next)
          //   }
          //   else{
          //     res.send({message:"You dont have permission to do that"})
          //   }
          // })


        } catch (error) {
          next(new HttpException(error.originalError.status || 400, error));
        }
      },

    );

    this.router.delete(this.delete, authMiddleware, async (req, res, next) => {
      try {
        this.deleteBranches(req, res, next)

        // Permission.findOne({
        //   where:{
        //     DocTypeID:this.DOCTYPE,
        //     RoleSeries:req.user.permissions
        //   }
        // }).then((data)=>{

        //   if(data?.Delete){  
        //   this.deleteBranches(req, res, next)
        //             }
        //   else{
        //     res.send({message:"You dont have permission to do that"})
        //   }
        // })

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

  private getBranchesBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {

    let { series } = request.params;
    const { Branches } = request.db.models;

    let BranchesResult = await Branches.findOne({
      where: { Series: series },
      // attributes: ["Series", "BranchName", "isGroup", "ParentBranch"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while find one  Branches."
      })
    });

    if (!BranchesResult) {
      next(new NotFoundException(series, "Branches"));
      return;
    }

    console.log("User (action)  : get By Series [Branches] By : {" + request.userName + "}    Date:" + Date());

    response.send(BranchesResult);
  };

  getAllBranches = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { Branches } = request.db.models;


    try {
      //   var  config = require('../../db/config.ts');
      //   const  sql = require('mssql');
      //   let  pool = await  sql.connect(config);
      //   let  products = await  pool.request().query(
      //     "select distinct(Party.Series) as owner,COUNT(Party.Series) as [number of Property] from Property p join Party on p.Party=Party.Series group by Party.Series");
      // response.status(200).send(products.recordsets)
      //   var  config = require('../../db/config.ts');
      //   const  sql = require('mssql');
      //   let  pool = await  sql.connect(config);
      //   let ss="PROP-1"
      //   let  products = await  pool.request().query(
      //     "select  dbo.getSeriesToGettingOwner('"+ss+"') as Owner");
      // response.status(200).send(products.recordsets)

      await Branches.findAll({
        where: { ...filters },
        offset: parseInt(page) * parseInt(pageSize),
        limit: parseInt(pageSize),
      }).then(data => {
        if (data.length == 0) {
          console.log({ message: " there is no data ... in tbl Branches" });
          response.send(data);
        }
        else {
          console.log("User (action)  : getAll [Branches] By : {" + request.userName + "}    Date:" + Date());

          return response.send(data);
        }
      }).catch((err: any) => {
        console.log((err));

        response.status(400).send(err)
      });

    } catch (error) {
      console.log(error)
      response.send(error)
    }
  }


  UpdateBranches = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const BranchesUpdate: CreateBranches = request.body;
    const { Branches } = request.db.models;

    let series = request.params.series;
    let result;
    try {
      let oldBranches = await Branches.findOne({
        attributes: ["Series", "BranchName", "isGroup", "ParentBranch"],
        where: {
          Series: series,
        },
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while creating Branches."
        })
      });

      result = await Branches.update(
        {
          ...BranchesUpdate,
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
          console.log("User (action)  : Update [Branches] By : {" + request.userName + "}    Date:" + Date());

          response.status(201).send("updated");

          this.io
            .to(request.UserSeries)
            .emit("Update", { doctype: "Branches", data: BranchesUpdate });
        }
        else {
          response.status(404).send(series + "  Not found");
        }
      }).catch((err) => {
        if (err.name == "SequelizeUniqueConstraintError") {
          return response.status(400).send({ message: "BranchName has already used . please try another name." });
        } else if (err.name == "SequelizeDatabaseError") {
          return response.status(401).send({ message: "error in forign key (Parent Branch) || should be exist or null." });
        } else
          return response.status(402).send({ message: err.name || "There is some Error in creating Branches" });
      })



    }
    catch (error) {
      next(new AddingRowException(error, "Branches"));

      return;
    }

    next();
  };
  createBranches = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const BranchesCreate: CreateBranches = request.body;
    const { Branches } = request.db.models;
    let lastSeries;

    console.log("hello");

    // const newBranches: TypeBranches = {
    //   Series: "Bra-" + lastSeries,
    //   BranchName: request.body.BranchName,
    //   isGroup: request.body.isGroup ? request.body.isGroup : false,
    //   ParentBranch: request.body.ParentBranch
    // };
    // console.log(this.DOCTYPE);

    await Branches.findOne({
      attributes: ["Series", "BranchName", "isGroup", "ParentBranch"],
      order: [["id", "DESC"]],
    }).
      then((data: any) => {
        if (!data) {
          lastSeries = 1;
        } else {
          lastSeries = +data.dataValues.Series.substring(4) + 1;
        }
      }).catch((err) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while retrieving Branches."
        })
      });
    let result;
    try {

      result = await Branches.create({
        ...BranchesCreate,
        Series: "BRA-" + lastSeries,
        createdBy: request.userName,
        createdAt: new Date()
      })
      Branches.Series = result.dataValues.Series;
      console.log("User (action)  : Create new [Branches] By : {" + request.userName + "}    Date:" + Date());

      response.status(201).send(result);


      this.io.to(request.UserSeries).emit("Add", { doctype: "Branches", data: result })
    }
    catch (err) {
      if (err.name == "SequelizeUniqueConstraintError") {
        return response.status(400).send({ message: "BranchName has already used . please try another name." });
      } else if (err.name == "SequelizeDatabaseError") {
        return response.status(400).send({ message: "error in forign key (Parent Branch) || should be exist or null." });
      } else
        return response.status(400).send({ message: err.name || "There is some Error in creating Branches" });
    }

    next();
  };

  deleteBranches = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const BranchesReq = request.params;
    const { Branches } = request.db.models;
    let result;
    try {
      // const oldBranches = await Branches.findOne({
      //   where: { Series: BranchesReq.series },
      //   attributes: ["Series", "BranchName","isGroup","ParentBranch"],
      // });

      await Branches.destroy({
        where: {
          Series: BranchesReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {
          this.io
            .to(request.UserSeries)
            .emit("Delete", { doctype: "Branches", data: BranchesReq });

          console.log("User (action)  : delete one [Branches] By : {" + request.userName + "}    Date:" + Date());

          return response.status(200).json({
            message: "Branches was deleted successfully!"
          })
        } else {
          return response.send({
            message: `Cannot delete Branches with Series=${BranchesReq.series}. Maybe Branches was not found!`
          });
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
            err.name || "Some error occurred while deleting Branches."
        })

      }
      })




    } catch (error) {
      response.status(400).send({
        message:
          error.message || "Some error occurred while Deleting the Branches."
      });
    }


    next();
  };
}

export default BranchesController;
