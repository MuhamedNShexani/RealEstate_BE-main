import * as express from "express";
import CreateBOMDto from "./BOM.dto";
import validationMiddleware from "../../middleware/validation.middleware";
import authMiddleware from "../../middleware/auth.middleware";

import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import permissionsMiddleware from "../../middleware/permissions.middleware";
import NotFoundException from "../../exceptions/NotFoundException";
import ActivityLogMiddleware from "../../middleware/ActivityLog.middleware";
import BranchPermissionMiddleware from "../../middleware/BranchPermission.middleware";
import Permission from "../PermissionModels/Permission.model";

class BOMController extends BaseController {
  public get = "/BOM/:series";
  public read = "/BOM";
  public delete = "/BOM/:series";
  public create = "/BOM";
  public router = express.Router();
  public io;
  public DOCTYPE_SERIES = ["DT-23"];

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        const val = permissionsMiddleware(
          this.DOCTYPE_SERIES,
          ["Read"],
          req.user.permissions,
          () => this.getBOMById(req, res, next)
        );
        if (val) throw val;
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
    this.router.get(
      this.read,
      authMiddleware,
      async (req, res, next) => {
        try {
          console.log(req.user.permissions);
          const val = permissionsMiddleware(
            this.DOCTYPE_SERIES,
            ["Read"],
            req.user.permissions,
            () => this.getAllBOM(req, res, next)
          );
          console.log(val);
          if (val) throw val;
        } catch (error) {
          console.log(error);
          next(
            new HttpException(
              error.originalError.status || 400,
              error.originalError.message
            )
          );
        }
      },
      BranchPermissionMiddleware
    );
    this.router.post(
      this.create,
      authMiddleware,
      validationMiddleware(CreateBOMDto),
      async (req, res, next) => {
        try {
          if (req.body.Series === undefined || req.body.Series === "") {
            const val = permissionsMiddleware(
              this.DOCTYPE_SERIES,
              ["Create"],
              req.user.permissions,
              () => this.createUpdateBOM(req, res, next)
            );

        Permission.findOne({
          where:{
            DocTypeID:this.DOCTYPE_SERIES,
            RoleSeries:req.user.permissions
          }
        })
        //     "ID": 8,
        // "Series": "PER-1",
        // "RoleSeries": "ROL-1",
        // "DocTypeID": "DT-1",
        // "Read": true,
        // "Write": true,
        // "Create": true,
        // "Delete": true,
        // "createdBy": "MM",
        // "updatedBy": null,
        // "createdAt": "2022-08-20T14:48:43.030Z",
        // "updatedAt": "2022-08-20T14:48:43.030Z"

            if (val) throw val;
          } else {
            const val = permissionsMiddleware(
              this.DOCTYPE_SERIES,
              ["Write", "Amend"],
              req.user.permissions,
              () => this.createUpdateBOM(req, res, next)
            );

            console.log(val);
            if (val) throw val;
          }
        } catch (error) {
          next(new HttpException(error.originalError.status || 400, error));
        }
      },
      ActivityLogMiddleware
    );
    this.router.delete(
      this.delete,
      authMiddleware,
      async (req, res, next) => {
        try {
          console.log(req.user.permissions);
          const val = permissionsMiddleware(
            this.DOCTYPE_SERIES,
            ["Delete"],
            req.user.permissions,
            () => this.deleteBOM(req, res, next)
          );
          console.log(val);
          if (val) throw val;
        } catch (error) {
          console.log(error);
          next(
            new HttpException(
              error.originalError.status || 400,
              error.originalError.message
            )
          );
        }
      },
      ActivityLogMiddleware
    );
  }
  private getBOMById = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;
    const { BOM } = request.db.models;

    let BOMRes = await BOM.findOne({
      where: { Series: series },
      raw: true,
      attributes: [
        "Series",
        "Item",
        "BOMItems",
        "BOMScrapedItems",
        "UOM",
        "CostBasedOn",
        "MaterialCost",
        "ScrapCost",
        "TotalCost",
        "isActive",
      ],
    });

    if (!BOMRes) {
      next(new NotFoundException(series, "BOM"));
      return;
    }

    console.log(BOMRes);

    response.send(BOMRes);
  };

  getAllBOM = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { BOM } = request.db.models;

    console.log(filters);

    this.clearEmptyFilters(filters);
    const { count, rows } = await BOM.findAndCountAll({
      where: { ...filters },
      raw: true,
      attributes: [
        "Series",
        "Item",
        "BOMItems",
        "BOMScrapedItems",
        "UOM",
        "CostBasedOn",
        "MaterialCost",
        "ScrapCost",
        "TotalCost",
        "isActive",
        "createdBy",
      ],
      offset: parseInt(page) * parseInt(pageSize),
      limit: parseInt(pageSize),
    });
    request.rows = rows;
    request.count = count;
    next();
  };

  createUpdateBOM = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const BOMCreate: CreateBOMDto = request.body;
    const { BOM } = request.db.models;

    let BOMRes = await BOM.findOne({
      raw: true,
      attributes: ["Series"],
      order: [["id", "DESC"]],
    });
    let series =
      BOMCreate.Series !== "" && BOMCreate.Series
        ? BOMCreate.Series
        : "BOM-" + (parseInt(BOMRes?.Series?.split("-")[1] ?? 0) + 1);
    console.log(series);
    let result;
    try {
      if (BOMCreate.Series === "" || BOMCreate.Series === undefined) {
        result = await BOM.create({
          ...BOMCreate,
          Series: series,
          createdBy: request.user.Series,
          updatedBy: "",
          createdAt: new Date(),
          updatedAt: "",
        });

        this.addActivityLogDataToRequest(
          request,
          { ...BOMCreate, Series: result.Series },
          0,
          this.DOCTYPE_SERIES[0],
          result.Series
        );
      } else {
        let old = await BOM.findOne({
          raw: true,
          attributes: [
            "Series",
            "Item",
            "BOMItems",
            "BOMScrapedItems",
            "UOM",
            "CostBasedOn",
            "MaterialCost",
            "ScrapCost",
            "TotalCost",
            "isActive",
          ],
          where: {
            Series: series,
          },
        });
        result = await BOM.update(
          {
            ...BOMCreate,
            updatedBy: request.user.Series,
            updatedAt: new Date(),
          },
          {
            where: {
              Series: series,
            },
          }
        );

        this.addActivityLogDataToRequest(
          request,
          { newData: BOMCreate, oldData: old },
          1,
          this.DOCTYPE_SERIES[0],
          BOMCreate.Series
        );
      }
    } catch (error) {
      console.log(error);
      next(new HttpException(422, error));
      return;
    }

    response.send(result);

    if (result)
      if (BOMCreate.Series !== "") {
        this.io
          .to(request.user.Account)
          .emit("Update", { doctype: "BOM", data: BOMCreate });
      } else {
        BOM.Series = series;
        this.io
          .to(request.user.Account)
          .emit("Add", { doctype: "BOM", data: result });
      }
    // request.usersAccessList.map((user) => {
    //   if (BOMCreate.Series !== "") {
    //     this.io.to(user).emit("Update", { doctype: "BOM", data: BOMCreate });
    //   } else {
    //     BOM.Series = series;
    //     this.io.to(user).emit("Add", { doctype: "BOM", data: result });
    //   }
    // });
    next();
  };

  deleteBOM = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const BOMReq = request.params;
    const { BOM } = request.db.models;
    const old = await BOM.findOne({
      where: { Series: BOMReq.series },
      raw: true,
      attributes: [
        "Series",
        "Item",
        "BOMItems",
        "BOMScrapedItems",
        "UOM",
        "CostBasedOn",
        "MaterialCost",
        "ScrapCost",
        "TotalCost",
        "isActive",
      ],
    });
    const result = await BOM.destroy({
      where: {
        Series: BOMReq.series, //this will be your id that you want to delete
      },
    });

    if (result === 0) {
      next(new NotFoundException(BOMReq.series, "BOM"));
      return;
    } else response.send();

    this.addActivityLogDataToRequest(
      request,
      old,
      2,
      this.DOCTYPE_SERIES[0],
      BOMReq.series
    );

    this.io
      .to(request.user.Account)
      .emit("Delete", { doctype: "BOM", data: BOMReq });
    next();
  };
}

export default BOMController;
