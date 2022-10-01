import * as express from "express";
import CreateProperty from "./CreateProperty.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";
const satelize = require("satelize")
const NodeGeocoder = require('node-geocoder');


class PropertyController extends BaseController {
  public get = "/Property/:series";
  public read = "/Property/";
  public delete = "/Property/:series";
  public Update = "/Property/:series";
  public create = "/Property/";
  public io;

  public router = express.Router();
  public Property: any; //new Property();
  public DOCTYPE = ["DT-8"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getPropertyBySeries(req, res, next)

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
        this.getAllProperty(req, res, next)

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
    this.router.put(this.Update, authMiddleware, validationMiddleware(CreateProperty),
      async (req, res, next) => {
        try {
          this.UpdateProperty(req, res, next)

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
      validationMiddleware(CreateProperty),
      async (req, res, next) => {
        try {
          this.createProperty(req, res, next)

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
        this.deleteProperty(req, res, next)

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

  private getPropertyBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { Property } = request.db.models;

    let PropertyResult = await Property.findOne({
      where: { Series: series },
      // attributes: ["Series", "Territory", "Purpose", "Location", "Attributes", "ISFurnished", "Furnitures", "Party", "RequestedAmt", "Currency"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while findOne Property."
      })
    });

    if (!PropertyResult) {
      next(new NotFoundException(series, "Property"));
      return;
    }
    PropertyResult.dataValues.Furnitures=PropertyResult.dataValues.Furnitures==null?[] :JSON.parse(PropertyResult.dataValues.Furnitures)
    PropertyResult.dataValues.Attributes=PropertyResult.dataValues.Attributes==null?[]:JSON.parse(PropertyResult.dataValues.Attributes)    
    console.log("User (action)  : get by Series [Property]  By : {" + request.userName + "} , Date:" + Date());

    response.send(PropertyResult);
  };

  getAllProperty = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { Property } = request.db.models;

    // satelize.satelize({ip:"66.171.248.170"},(err,payload)=>{
    //   if(err)console.log(err);

    //   console.log(payload);

    // })

    // const options = {
    //   provider: 'mapquest',
    // httpadapter:"https",
    //   // Optional depending on the providers
    //   apiKey: "G2iFTmnRks81xnLHz3k6O3zmdQdukxut", // for Mapquest, OpenCage, Google Premier
    //   formatter: null // 'gpx', 'string', ...
    // };

    // const geocoder = NodeGeocoder(options);

    // Using callback
    // const res = await geocoder.geocode('29 champs elysée paris');
    // let loc=await geocoder.geocode("Gölbaşı, Savur/Mardin, Turkey")
    // console.log(loc);

    try {
      const res = await Property.findAll({
        where: { Available:true },
        // attributes: ["Series", "Territory", "Purpose", "Location", "Attributes", "ISFurnished", "Furnitures", "Party", "RequestedAmt", "Currency"],
        offset: parseInt(page) * parseInt(pageSize),
        limit: parseInt(pageSize),
      }).then((data:any) => {
        if (data.length == 0) {
          console.log({ message: " there is no data ... in tbl Property" });
          response.send(data);
        }
        else {let i:any
          console.log("User (action)  : GetAll [Property]  By : {" + request.userName + "} , Date:" + Date());
          for( i in data){            
            if(data[i].dataValues.Furnitures==null){
              data[i].dataValues.Furnitures=[]
            }
            if(data[i].dataValues.Attributes==null){
              data[i].dataValues.Attributes=[]
            }

          }
          
          response.send(data);
        }
      }).catch((err: any) => {
        console.log(err);
        
        response.status(400).send({
          message:
            err.name || "Some error occurred while Finding All Property."
        })
      });
    } catch (error) {
      console.log(error)
      response.send(error)
    }

  };

  UpdateProperty = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const PropertyUpdate: CreateProperty = request.body;
    const { Property } = request.db.models;

    let series = request.params.series;
    let result;
    try {
      let oldProperty = await Property.findOne({
        where: {
          Series: series,
        },
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while creating Property."
        })
      });

      result = await Property.update(
        {
          ...PropertyUpdate,
          Attributes: JSON.stringify(request.body.Attributes),
          Furnitures: JSON.stringify(request.body.Furnitures),
          ExtraPayment: JSON.stringify(request.body.ExtraPayment),
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
          console.log("User (action)  : Update [Property]  By : {" + request.userName + "} , Date:" + Date());

          response.status(201).send("updated");
          this.io
            .to(request.UserSeries)
            .emit("Update", { doctype: "Property", data: PropertyUpdate });
        }
        else {
          response.status(404).send("Series " + series + " Not found")
        }
      }).catch((err: any) => {
        if (err.index != undefined)
          response.status(400).send({ message: "error in forign key " + err.index + " || should be exist ." });
        else {
          response.status(400).send({ message: err.name || "There is some Error in Updating Property" });
        }
      });
    }
    catch (error) {
      next(new AddingRowException(error, "Property"));

      return;
    }

    next();
  };
  createProperty = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const PropertyCreate: CreateProperty = request.body;
    const { Property } = request.db.models;
    let lastSeries;

    await Property.findOne({
      order: [["id", "DESC"]],
    }).
      then((data: any) => {
        if (!data) {
          lastSeries = 1;
        } else {
          lastSeries = +data.dataValues.Series.substring(5) + 1;
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while retrieving Property."
        })
      });
    let result;
    try {

      result = await Property.create({
        ...PropertyCreate,
        Available:true,
        Attributes: JSON.stringify(request.body.Attributes),
        Furnitures: JSON.stringify(request.body.Furnitures),
        ExtraPayment: JSON.stringify(request.body.ExtraPayment),
        Series: "PROP-" + lastSeries,
        createdBy: request.userName,
        createdAt: new Date(),
      }).then((data: any) => {
        Property.Series = data.dataValues.Series;
        console.log("User (action)  : Create New [Property]  By : {" + request.userName + "} , Date:" + Date());

        response.status(201).send(data)
        this.io
          .to(request.UserSeries)
          .emit("Add", { doctype: "Property", data: data });

      }).catch((err: any) => {
        
        if (err.index != undefined)
          response.status(400).send({ message: "error in forign key " + err.index + " || should be exist ." });
        else {
          response.status(400).send({ message: err.name || "There is some Error in creating Property" });
        }

      });


    } catch (error) {
      next(new AddingRowException(error, "Property"));
      return;
    }

    next();
  };

  deleteProperty = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const PropertyReq = request.params;
    const { Property,CurrentUser } = request.db.models;
    let result;
    try {
      const oldProperty = await Property.findOne({
        where: { Series: PropertyReq.series },
        attributes: ["Series", "Territory", "Purpose", "Location", "Attributes", "ISFurnished", "Furnitures", "Party", "RequestedAmt", "Currency"],
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while findig old Property."
        })
      });
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
      await Property.destroy({
        where: {
          Series: PropertyReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {
          console.log("User (action)  : Delete [Property]  By : {" + request.userName + "} , Date:" + Date());

          response.send({
            message: "Property was deleted successfully!"
          });
          this.io
            .to(request.UserSeries)
            .emit("Delete", { doctype: "Property", data: PropertyReq });
        } else {
          return response.send({
            message: `Cannot delete Property with Series=${PropertyReq.series}. Maybe Property was not found!`
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
            err.name || "Some error occurred while deleting Property."
        })}
      })
      next();

    } catch (error) {
      response.status(400).send({
        message:
          error.message || "Some error occurred while Deleting the Property."
      });

    }



    next();
  };
}

export default PropertyController;
