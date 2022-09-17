require("dotenv").config();
import * as express from "express";
import * as jwt from "jsonwebtoken";
import AuthenticationTokenMissingException from "../exceptions/AuthenticationTokenMissingException";
import WrongAuthenticationTokenException from "../exceptions/WrongAuthenticationTokenException";
import Payload from "../Models/Token/Payload";
import YouHaveBeenLogedOutTokenException from "../exceptions/YouHaveBeenLogedOutTokenException";
import { Sequelize } from "sequelize";
import Territory from "../Models/TerritoryModels/Territory.model";
import Branches from "../Models/BranchesModels/Branches.model";
// import Account from "../Models/Account/Account.model";
import ContractTemplates from "../Models/ContractTemplatesModels/ContractTemplates.model";
import PrintKeys from "../Models/PrintKey/Printkey.model";
import ContractType from "../Models/ContractTypeModels/ContractType.model";
import Currency from "../Models/CurrencyModels/Currency.model";
import Party from "../Models/PartyModels/Party.model";
import Payments from "../Models/PaymentsModels/Payments.model";
import Permission from "../Models/PermissionModels/Permission.model";
import Roles from "../Models/RolesModels/Roles.model";
import Contracts from "../Models/ContractsModels/Contracts.model"
import Property from "../Models/PropertyModels/Property.model";
import Purpose from "../Models/PurposeModels/Purpose.model";
import PropertyAttr from "../Models/PropertyAttrModels/PropertyAttr.model";
import PropertyType from "../Models/PropertyTypeModels/PropertyType.model";
import Users from "../Models/UsersModels/Users.model";
import DocTypes from "../Models/DocTypes/DocTypes.model";
import Perms from "../Models/PERM/Per.model";
import Attachment from "../Models/attachment/Attachment.model";
import CurrencyExchange from "../Models/CurrencyExchangeModels/CurrencyExchange.model";

let dbConfig = {
  HOST: "localhost",
  PORT: 1433,
  USER: "MuhamedShexani",
  PASSWORD: "123456788mmnM",
  DB: "RealEstate",
  dialect: "mssql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 1000,
    logging: false,

  }, define: {
    timestamps: true,
    freezeTableName: true,
  },
  dialectOptions: {
    encrypt: true,
    useUTC: false, //for reading from database
    dateStrings: true,
    typeCast: function (field, next) {
      // for reading from database
      if (field.type === "DATETIME") {
        return field.string();
      }
      return next();
    },
  },
  timezone: "+00:00"
}

async function authMiddleware(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) {
  const head = request.headers;
  if (head.authorization === undefined)
    next(new WrongAuthenticationTokenException());
  try {
    head.authorization = head.authorization.split(" ");
    const token = head.authorization[1].replace(/"/g, "");
    if (head && token) {
      let secret;
      if (process.env.ACCESS_TOKEN_SECRET == undefined) {
        response.send("something went wrong in token ")
      } else {
        secret = process.env.ACCESS_TOKEN_SECRET;
      }
      try {
        const token = head.authorization[1].replace(/"/g, "");
        const verificationResponse = jwt.verify(token, secret) as Payload;
        // console.log(verificationResponse);

        const CurrentUser = verificationResponse.UserName;
        const UserSeries = verificationResponse.Series;
        // console.log("Current:",UserSeries)
        let sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
          host: dbConfig.HOST,
          port: dbConfig.PORT,
          dialect: "mssql",
          "logging": false,
          define: {
            timestamps: true,
            freezeTableName: true
          },
          pool: {
            max: dbConfig.pool.max,
            min: dbConfig.pool.min,
            acquire: dbConfig.pool.acquire,
            idle: dbConfig.pool.idle,

          },
          dialectOptions: {
            options: {
              encrypt: true,
              packetSize: 32768

            }
          }
        });
        Users.initialize(sequelize)

        const user: any = await Users.findOne({
          where: { Series: UserSeries },
        })


        if (user) {

          let sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
            host: dbConfig.HOST,
            port: dbConfig.PORT,
            dialect: "mssql",
            "logging": false,
            define: {
              timestamps: true,
              freezeTableName: true
            },
            pool: {
              max: dbConfig.pool.max,
              min: dbConfig.pool.min,
              acquire: dbConfig.pool.acquire,
              idle: dbConfig.pool.idle,

            },
            dialectOptions: {
              options: {
                encrypt: true,
                packetSize: 32768

              }
            }
          });

          let models = [Branches,
            Perms,
            CurrencyExchange,
            ContractTemplates,
            ContractType,
            Currency,
            Party,
            PrintKeys,
            Payments,
            Permission,
            Roles,
            Contracts,
            Property,
            Purpose,
            PropertyAttr,
            PropertyType
            , Territory,
            DocTypes,
            Attachment,
            Users];

          models.forEach((model) => model.initialize(sequelize));
          const perms = await Permission.findOne({
            where: { RoleSeries: user.dataValues.RoleID },
            raw: true,
          });
          // const AccountInfo = await Account.findOne({
          //   where: {
          //     Series: user.dataValues.Account,
          //   },
          //   raw: true,
          // });

          user.permissions = perms ? perms.RoleSeries : [];
          // request.accountInfo = AccountInfo;
          request.user = user;
          request.userName = CurrentUser;
          request.Users = Users;
          request.db = sequelize;

          // request.user = CurrentUser;
          request.UserSeries = UserSeries;
          next();
        } else {
          next(new YouHaveBeenLogedOutTokenException());
        }
      } catch (error) {
        console.log(error);
        next(new WrongAuthenticationTokenException());
      }
    } else {
      next(new AuthenticationTokenMissingException());
    }
  } catch (error) {
    next(new AuthenticationTokenMissingException());

  }
}
export default authMiddleware;
