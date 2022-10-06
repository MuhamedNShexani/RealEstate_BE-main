import * as express from "express";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt"
import CreateUsers from "./CreateUsers.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import authMiddleware from "../../middleware/auth.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import SignMiddlware from "../../middleware/Sign";
//import permissionsMiddleware from "../../middleware/permissions.middleware";

class UsersController extends BaseController {
  public get = "/Users/:series";
  public read = "/Users/";
  public delete = "/Users/:series";
  public Update = "/Users/:series";
  public create = "/Users/";
  public login = "/Users/login/";
  public io;

  public router = express.Router();
  public Users: any; //new Users();
  public DOCTYPE = ["DT-14"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getUsersBySeries(req, res, next)

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
        this.getAllUsers(req, res, next)

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
    this.router.put(this.Update, authMiddleware, validationMiddleware(CreateUsers),
      async (req, res, next) => {
        try {
          this.UpdateUsers(req, res, next)

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
      SignMiddlware,
      validationMiddleware(CreateUsers),
      async (req, res, next) => {
        try {
          this.createUsers(req, res, next)

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
        this.deleteUsers(req, res, next)

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
    this.router.post(
      this.login,
      SignMiddlware,
      async (req, res, next) => {
        try {
          this.loginUser(req, res, next)

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
  }

  private getUsersBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { Users } = request.db.models;

    let UsersResult = await Users.findOne({
      where: { Series: series },
      // attributes: ["Series", "FullName", "UserName", "Language", "RoleId", "FromDate", "ToDate", "Branch", "Disabled","Account"],
    }).catch((err: any) => {
      response.status(400).send({
        message:
          err.name || "Some error occurred while find One Users."
      })
    });

UsersResult.dataValues.Password=null;  


    if (!Users) {
      next(new NotFoundException(series, "Users"));
      return;
    }
    console.log("User (action)  : Get by Series [Users]  By : {" + request.userName + "} , Date:" + Date());

    response.send(UsersResult);
  };

  getAllUsers = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { Users } = request.db.models;

    try {
      const res = await Users.findAll({
        where: { ...filters },
        attributes: ["ID","Series", "FullName", "UserName", "Language", "RoleId", "FromDate", "ToDate", "Branch", "Disabled","DefaultCurrency","createdBy","createdAt","updatedAt","updatedBy"],
        offset: parseInt(page) * parseInt(pageSize),
        limit: parseInt(pageSize),
      }).then(data => {
        if (data.length == 0) {
          console.log({ message: " there is no data ... in tbl Users" });
          response.send(data);

        }
        else {
          console.log("User (action)  : GetAll [Users]  By : {" + request.userName + "} , Date:" + Date());

          response.send(data);
        }
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while finding All Users."
        })
      });
    } catch (error) {
      console.log(error)
      response.send(error)
    }

  };

  UpdateUsers = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const UsersUpdate: CreateUsers = request.body;
    const { Users } = request.db.models;

    let series = request.params.series;
    let result;
    try {
      let oldUsers = await Users.findOne({
        where: {
          Series: series,
        },
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while creating Users."
        })
      });

      result = await Users.update(
        {
          ...UsersUpdate,
          updatedBy:  request.userName,
          updatedAt: new Date(),
        },
        {
          where: {
            Series: series,
          },
          individualHooks: true,

        }
      ).then(data => {

        if (data[0] == 1) {
        

          let secret;
          let user = { UserName: request.userName, Series: request.params.series }
          // console.log(user)
          if (process.env.ACCESS_TOKEN_SECRET == undefined) {
            response.send("something went wrong")
          } else {
            secret = process.env.ACCESS_TOKEN_SECRET;
          }
          const accessToken = jwt.sign(user, secret, { expiresIn: "720h" })
          console.log("User (action)  : Update [Users] " + Date());

          response.status(201).send("updated");
          this.io
            .to(request.user.Series)
            .emit("Update", { doctype: "Users", data: UsersUpdate });
        }
        else {
          response.status(404).send("Series " + series + " Not found")
        }
      }
      ).catch((err) => {
        console.log(err);
        
        if (err.name == "SequelizeUniqueConstraintError") {
          if (err.errors[0].message == "UQ__Users__fullname must be unique") {
            response.status(400).send({ message: "(FullName) has already used . please try another name." });
          } else if (err.errors[0].message == "UQ__Users__username must be unique") {
            response.status(400).send({ message: "(UserName) has already used . please try another name." });
          }
        } else
          response.status(400).send({ message: "error in forign key " + err.index + " || should be exist ." || "There is some Error in creating User" });
      })

    }
    catch (error) {
      console.log(error);
      
      next(new AddingRowException(error, "Users"));

      return;
    }

    next();
  };
  createUsers = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;
    const UsersCreate: CreateUsers = request.body;
    const { Users } = request.db.models;
    let lastSeries;


    await Users.findOne({
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
            err.name || "Some error occurred while retrieving Users."
        })
      });

    try {
      await Users.create({
        ...UsersCreate,
        Series: "USR-" + lastSeries,
        createdBy: request.userName,
        createdAt: new Date(),
      }).then(data => {
        let user = { UserName: data.dataValues.UserName, Series: data.dataValues.Series }
        let secret;
        if (process.env.ACCESS_TOKEN_SECRET == undefined) {
          response.send("something went wrong")
        } else {
          secret = process.env.ACCESS_TOKEN_SECRET;
        }
        const accessToken = jwt.sign(user, secret, { expiresIn: "720h" })

        Users.Series = data.dataValues.Series;
        console.log("User (action)  : Create New [Users] " + Date());

        response.status(201).send({ data: data, accessToken: accessToken })
        this.io
          .to(request.user.Series)
          .emit("Add", { doctype: "Users", data: data });

      }).catch((err) => {
        console.log(err);
        
        if (err.name == "SequelizeUniqueConstraintError") {
          if (err.errors[0].message == "UQ__Users__fullname must be unique") {
            response.status(400).send({ message: "(FullName) has already used . please try another name." });
          } else if (err.errors[0].message == "UQ__Users__username must be unique") {
            response.status(400).send({ message: "(UserName) has already used . please try another name." });
          }
        } else if (err.index != undefined)
          response.status(400).send({ message: "error in forign key " + err.index + " || should be exist ." || "There is some Error in creating User" });
        else if (err.name = "SequelizeDatabaseError") {
          response.status(400).send({ message: " -- (FromDate) must be less than (ToDate)" || "There is some Error in creating User" });
        }
        else {
          response.status(400).send({ message: err.name || "There is some Error in creating User" });

        }
      })
    } catch (error) {
      next(new AddingRowException(error, "Users"));
      return;
    }


    next();
  };

  deleteUsers = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const UsersReq = request.params;
    const { Users,CurrentUser } = request.db.models;
    let result;
    try {
      const oldUsers = await Users.findOne({
        where: { Series: UsersReq.series },
        attributes: ["Series", "FullName", "UserName", "Language", "RoleId", "FromDate", "ToDate", "Branch", "Disabled"],
      }).catch((err: any) => {
        response.status(400).send({
          message:
            err.name || "Some error occurred while finding old Users."
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
      await Users.destroy({
        where: {
          Series: UsersReq.series, //this will be your id that you want to delete
        },
      }).then((num: number) => {
        if (num == 1) {

          console.log("User (action)  : Delete [Users] By " + request.user + "    Date:" + Date());


          response.send({
            message: "Users was deleted successfully!"
          });
        } else {
          this.io
            .to(request.user.Series)
            .emit("Delete", { doctype: "Users", data: UsersReq });
          response.send({
            message: `Cannot delete Users with Series=${UsersReq.series}. Maybe Users was not found!`
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
            err.name || "Some error occurred while deleting Users."
        })}
      })

    } catch (error) {
      response.status(400).send({
        message:
          error.message || "Some error occurred while Deleting the Users."
      });
      // next(new HttpException(422, error));
      // return;
    }



    next();
  };

  loginUser = async (request: express.Request,
    response: express.Response,
    next: express.NextFunction) => {
    const { Users, Perms } = request.db.models;
    const { UserName, Password } = request.body;
    // 1) Check if email and Password exist
      try {
         if (!UserName || !Password) {
      return next(response.end("Please provide email and Password!"));
    }
    else{
    // 2) Check if user exists && Password is correct
 
      Users.findOne({
        where: {
          UserName: UserName // user email
        }
      }).then(async (data: express.datauest) => {
        if (!data) {
          return response.end('Incorrect email or Password')
        } else {
          // console.log(data.dataValues.Series)
          if (!data.dataValues.Password ||
            !await bcrypt.compareSync(Password, data.dataValues.Password)) {
            return response.end('Incorrect  Password');
          } else {
            let secret;
            if (process.env.ACCESS_TOKEN_SECRET == undefined) {
              response.send("something went wrong")
            } else {
              secret = process.env.ACCESS_TOKEN_SECRET;
            }
            let user = { UserName: data.dataValues.UserName,defaultCurrency:data.dataValues.DefaultCurrency, Series: data.dataValues.Series, RoleID: data.dataValues.RoleID }
            const accessToken = jwt.sign(user, secret, { expiresIn: "720h" });
       
            let Pusher = require('pusher');
            let pusher = new Pusher({
              appId: "1464760",
              key: "902a182571ab0eaf222f",
              secret: "9245d2e3538084fb4b19",
              cluster: "ap2",
              useTLS: true,
            });

            // pusher.trigger('notifications', 'post_updated', post, req.headers['x-socket-id']);
            pusher.trigger("my-channel", "my-event", {
              message: "user " + user.UserName + " has been  Login ",
            });
            let PermsResult = await Perms.findOne({
              where: { RoleSeries: data.dataValues.RoleID },
              // attributes: ["Series", "RoleSeries", "DocTypeID", "Read", "Write", "Create", "Delete"],
            }).catch((err: any) => {
              response.status(400).send({
                message:
                  err.name || "Some error occurred while find one Perms."
              })
            });
if(user.UserName=='ADMIN'){
                let JsonData="[{\"DocTypeID\":\"DT-1\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"Amend\":true,\"Cancel\":true,\"DocTypeName\":\"Branches\"},{\"DocTypeID\":\"DT-2\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"Amend\":true,\"Cancel\":true,\"DocTypeName\":\"Contracts\"},{\"DocTypeID\":\"DT-3\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"Amend\":true,\"Cancel\":true,\"DocTypeName\":\"ContractTemplates\"},{\"DocTypeID\":\"DT-4\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"Amend\":true,\"Cancel\":true,\"DocTypeName\":\"ContractType\"},{\"DocTypeID\":\"DT-5\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"Amend\":true,\"Cancel\":true,\"DocTypeName\":\"Party\"},{\"DocTypeID\":\"DT-6\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"Amend\":true,\"Cancel\":true,\"DocTypeName\":\"Payments\"},{\"DocTypeID\":\"DT-7\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"Amend\":true,\"Cancel\":true,\"DocTypeName\":\"Permission\"},{\"DocTypeID\":\"DT-8\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"Amend\":true,\"Cancel\":true,\"DocTypeName\":\"Property\"},{\"DocTypeID\":\"DT-9\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"Amend\":true,\"Cancel\":true,\"DocTypeName\":\"PropertyAttr\"},{\"DocTypeID\":\"DT-10\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"Amend\":true,\"Cancel\":true,\"DocTypeName\":\"PropertyType\"},{\"DocTypeID\":\"DT-11\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"Amend\":true,\"Cancel\":true,\"DocTypeName\":\"Purpose\"},{\"DocTypeID\":\"DT-12\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"Amend\":true,\"Cancel\":true,\"DocTypeName\":\"Roles\"},{\"DocTypeID\":\"DT-13\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"Amend\":true,\"Cancel\":true,\"DocTypeName\":\"Territory\"},{\"DocTypeID\":\"DT-14\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"Amend\":true,\"Cancel\":true,\"DocTypeName\":\"Users\"},{\"DocTypeID\":\"DT-15\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"Amend\":true,\"Cancel\":true,\"DocTypeName\":\"Currency\"},{\"DocTypeID\":\"DT-10\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"Amend\":true,\"Cancel\":true,\"DocTypeName\":\"PropertyType\"},{\"DocTypeID\":\"DT-16\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"DocTypeName\":\"CurrencyExchange\"},{\"DocTypeID\":\"DT-17\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"DocTypeName\":\"Attachment\"},{\"DocTypeID\":\"DT-18\",\"Read\":true,\"Write\":true,\"Create\":true,\"Delete\":true,\"DocTypeName\":\"Lawyer\"}]"
                PermsResult = JSON.parse(JsonData);
                
}else{
  PermsResult = JSON.parse(PermsResult.JsonData);
}
            let A: any = [];
            PermsResult.map((i) => {
              if (i.Create) {
                A.push({
                  action: "create",
                  subject: i.DocTypeID
                })
              }
              if (i.Read) {
                A.push({
                  action: "read",
                  subject: i.DocTypeID
                })
              }
              if (i.Delete) {
                A.push({
                  action: "delete",
                  subject: i.DocTypeID
                })
              }
              if (i.Write) {
                A.push({
                  action: "write",
                  subject: i.DocTypeID
                })
              }


            }

            )
            A.push({
              action: "read",
              subject: "DASH",
            })
            if(data.dataValues.Disabled){
              response.send({
                accessToken: accessToken, userSeries: user.Series,defaultCurrency:user.defaultCurrency,message:"You are disabled"
              })  
            }else
            response.send({
              accessToken: accessToken, userSeries: user.Series,defaultCurrency:user.defaultCurrency, Permissions: A
            })

          }
        }
      }).catch((err: any) => {
        console.log(err);

        response.status(400).send({
          message:
            err.name || "Some error occurred while login Users."
        })
      })}
    } catch (error) {

      response.send(error)
    };
  }
}


export default UsersController;
