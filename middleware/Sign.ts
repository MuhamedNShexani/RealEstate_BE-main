require("dotenv").config();
import * as express from "express";

import { Sequelize } from "sequelize";
import Attachment from "../Models/attachment/Attachment.model";
import Contracts from "../Models/ContractsModels/Contracts.model";
import Perms from "../Models/Permission/Permission.model";
import Users from "../Models/UsersModels/Users.model";


async function SignMiddlware(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) {

    try {
      let dbConfig={  
        HOST: process.env.SERVER,
        PORT: 1433,
        USER: process.env.USER,
        PASSWORD: process.env.PASSWORD,
        DB: process.env.DATABASE,
        dialect: "mssql",
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 1000,
              logging: false,
  
        },define: {
          timestamps: true,
          freezeTableName: true,
        },
        dialectOptions: {
          encrypt:true,
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
        timezone: "+00:00"}
  
      
      let sequelize=new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
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
            packetSize : 32768

          }
        }
      });
      // Initialize each model in the database
      // This must be done before associations are made
      let models = [     
        Users,
        Perms,
        Contracts,
        Attachment
      ];
      
      models.forEach((model) => model.initialize(sequelize));

      request.db = sequelize;
      next();
    } catch (error) {
      console.log("Error in Sign "+error);
    
    }
}
export default SignMiddlware;
