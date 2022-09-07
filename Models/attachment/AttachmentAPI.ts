import * as express from "express";
import validationMiddleware from "../../middleware/validation.middleware";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import NotFoundException from "../../exceptions/NotFoundException";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";
//import permissionsMiddleware from "../../middleware/permissions.middleware";

class AttachmentController extends BaseController {
  public get = "/Attachment/:series";
  public read = "/Attachment/";
  public delete = "/Attachment/:series";
  public Update = "/Attachment/:series";
  public create = "/Attachment/";
  public io;

  public router = express.Router();
  public Attachment: any; //new Attachment();
  public DOCTYPE = ["DT-2"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, authMiddleware, async (req, res, next) => {
      try {
        this.getAttachmentBySeries(req, res, next)

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
        this.getAllAttachment(req, res, next)

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
    this.router.put(this.Update, authMiddleware,
      async (req, res, next) => {
        try {
          this.UpdateAttachment(req, res, next)

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
      async (req, res, next) => {
        try {
          this.createAttachment(req, res, next)

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
        this.deleteAttachment(req, res, next)

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

  private getAttachmentBySeries = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let { series } = request.params;

    console.log("User (action)  : get By Series [Attachment] By : {" + request.userName + "} , Date:" + Date());

    response.send();
  };

  getAllAttachment = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { page, pageSize, filters } = request.query;
    const { Attachment } = request.db.models;
    const { google } = require('googleapis');
    const path = require('path');
    const fs = require('fs');

    const CLIENT_ID = '261832109476-1a09damq8qcni47i3h39eurmdssqt1o9.apps.googleusercontent.com';
    const CLIENT_SECRET = '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';
    const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

    const REFRESH_TOKEN = '1//047s2WtMT-di2CgYIARAAGAQSNgF-L9IrQtAGC25n1ZaA6ZYb5hXIDrtCnWi_8aGlwOPyGHsYLTw2k_bG72RLqy2BY7LTrdM_Ng';

    const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    const drive = google.drive({
      version: 'v3',
      auth: oauth2Client,
    });
    try {
      const fileId = '1cMlVTGfYbt0dIZeJ-i0m3nruFUTAkBz6';
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
  
      // /* 
      // webViewLink: View the file in browser
      // webContentLink: Direct download link 
      // */
      const result = await drive.files.get({
        fileId: fileId,
        fields: 'webViewLink, webContentLink',
      });

      // console.log(result.data);
      response.send(result.data);
        } catch (error) {
      console.log(error)
      response.send(error)
    }


  };

  UpdateAttachment = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    request.body.token = null;

    let series = request.params.series;
    let result;
    try {

    }
    catch (error) {
      next(new AddingRowException(error, "Attachment"));

      return;
    }

    next();
  };
  
  createAttachment = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {

    try {
      const { Attachment } = request.db.models;
      let Readable = require('stream').Readable; 
      const { image } = request.files;

      if (!image) return response.sendStatus(400);


      function bufferToStream(buffer) { 
        var stream = new Readable();
        stream.push(buffer);
        stream.push(null);
      
        return stream;
      }

      const { google } = require('googleapis');

      const CLIENT_ID = '261832109476-1a09damq8qcni47i3h39eurmdssqt1o9.apps.googleusercontent.com';
      const CLIENT_SECRET = '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';
      const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

      const REFRESH_TOKEN = '1//047s2WtMT-di2CgYIARAAGAQSNgF-L9IrQtAGC25n1ZaA6ZYb5hXIDrtCnWi_8aGlwOPyGHsYLTw2k_bG72RLqy2BY7LTrdM_Ng';

      const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
      );

      oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

      const drive = google.drive({
        version: 'v3',
        auth: oauth2Client,
      });

      /* 
      filepath which needs to be uploaded
      Note: Assumes example.jpg file is in root directory, 
      though this can be any filePath
      */
    //   const MIME_TYPES = {
    //     'imgs/jpg': 'jpg',
    //     'imgs/jpeg': 'jpeg',
    //     'imgs/png': 'png'
    // }
    
  
      
        try {
          let FileLink:any=[]

          for( var i in request.files.image){
          const media = {
            mimeType: request.files.image[i].mimetype,
            body: bufferToStream(request.files.image[i].data)
          };
        
        
            const file = await drive.files.create({
              resource: {
                name:request.files.image[i].name ,
                'parents': ["19V08sFwBEy9epXg1I5yh9k9T-Ht3tDs4"],
              },
              media: media,
              fields: 'id'
            });
            FileLink.push({link:'https://drive.google.com/file/d/'+file.data.id+'/view'});
         await   Attachment.create(
              {
                id:file.data.id,
                name:request.files.image[i].name,
                Link:'https://drive.google.com/file/d/'+file.data.id+'/view',
                Size:request.files.image[i].size,
                MimeType:request.files.image[i].mimetype,
                createdBy: request.userName,
                createdAt: new Date(),
                    })
          }           
          //  console.log('File lINL:', FileLink);  
          
          

                 response.status(200).send({})


       
        } catch (error) {
          console.log(error);
        }
      
    } catch (error) {
      next(new AddingRowException(error, "Attachment"));
      return;
    }

  };


  deleteAttachment = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    // const AttachmentReq = request.params;
    // const { Attachment } = request.db.models;
    // let result;
    const { google } = require('googleapis');
      const path = require('path');
      const fs = require('fs');

      const CLIENT_ID = '261832109476-1a09damq8qcni47i3h39eurmdssqt1o9.apps.googleusercontent.com';
      const CLIENT_SECRET = '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';
      const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

      const REFRESH_TOKEN = '1//047s2WtMT-di2CgYIARAAGAQSNgF-L9IrQtAGC25n1ZaA6ZYb5hXIDrtCnWi_8aGlwOPyGHsYLTw2k_bG72RLqy2BY7LTrdM_Ng';

      const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
      );

      oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

      const drive = google.drive({
        version: 'v3',
        auth: oauth2Client,
      });
    try {
      const response = await drive.files.delete({
        fileId: 'YOUR FILE ID',
      });
      console.log(response.data, response.status);

    } catch (error) {
      response.status(400).send({
        message:
          error.name || "Some error occurred while Deleting the Attachment."
      });

    }


  }
}

export default AttachmentController;
