import * as express from "express";
import BaseController from "../BaseController";
import HttpException from "../../exceptions/HttpExceptions";
import AddingRowException from "../../exceptions/errorInCreatingTable";
import authMiddleware from "../../middleware/auth.middleware";
import SignMiddlware from "../../middleware/Sign";
import NotFoundException from "../../exceptions/NotFoundException";


class AttachmentController extends BaseController {
  public get = "/Attachment/:refSeries";
  public Download = "/Attachment/download/:id";
  public view = "/Attachment/view/:id";
  public read = "/Attachment/";
  public delete = "/Attachment/:id/:refSeries";
  public create = "/Attachment/";
  public io;

  public router = express.Router();
  public Attachment: any; //new Attachment();
  // public DOCTYPE = ["DT-"]; //keep current Docktype at the first always

  constructor() {
    super();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.get, SignMiddlware, async (req, res, next) => {
      try {
        this.getAttachmentBySeries(req, res, next)

      } catch (error) {
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
        next(
          new HttpException(
            error.originalError.status || 400,
            error.originalError.message
          )
        );
      }
    });
    
    this.router.post(
      this.create,
      authMiddleware,
      async (req, res, next) => {
        try {
          this.createAttachment(req, res, next)

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
    this.router.get(
      this.Download,
      SignMiddlware,
      async (req, res, next) => {
        try {
          this.DownloadAttachment(req, res, next)

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
    this.router.get(
      this.view,
      SignMiddlware,
      async (req, res, next) => {
        try {
          this.ViewAttachment(req, res, next)

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
    const { Attachment } = request.db.models;
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
    try {


      let AttachmentResult = await Attachment.findAll({
        where: { refSeries: request.params.refSeries }
      })


      if (!AttachmentResult) {
        next(new NotFoundException(request.params.refSeries, "Attachment refSeries"));
        return;
      }
      console.log("User (action)  : Get by Series [Attachment]  By : {" + request.userName + "} , Date:" + Date());

      response.send(AttachmentResult);

    } catch (error) {
      response.send(error)
    }



  };

  getAllAttachment = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const { Attachment } = request.db.models;
    const { google } = require('googleapis');

    const CLIENT_ID = '261832109476-1a09damq8qcni47i3h39eurmdssqt1o9.apps.googleusercontent.com';
      const CLIENT_SECRET = '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';
      const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

      const REFRESH_TOKEN = '1//04_bQFY-mL6lPCgYIARAAGAQSNgF-L9IrJa8A7Y5ONsQZxV_sGAxmINoP03jQq_AjqQGX54akqNG8-maP1C6T7RH1LjzueVGajg'
  
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
      Attachment.findAll({}).then(data => {
        console.log("User (action)  : getAll [Attachment]  By : {" + request.userName + "} , Date:" + Date());
        response.status(200).send([])
      })


    } catch (error) {
      response.send(error)
    }
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
      const { refDoctype, refSeries } = request.query;

      if (!image) return response.sendStatus(400);
else{

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

      const REFRESH_TOKEN = '1//04_bQFY-mL6lPCgYIARAAGAQSNgF-L9IrJa8A7Y5ONsQZxV_sGAxmINoP03jQq_AjqQGX54akqNG8-maP1C6T7RH1LjzueVGajg'
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



      // mimetype=
      // image/jpeg
      // application/vnd.oasis.opendocument.spreadsheet
      // image/png
      // application/vnd.ms-powerpoint
      // application/vnd.ms-excel

      //   const MIME_TYPES = {
      //     'imgs/jpeg': 'jpeg',
      //     'image/png': 'png',
      //     'application/vnd.oasis.opendocument.spreadsheet':'application/vnd.oasis.opendocument.spreadsheet',
      //     'application/vnd.ms-powerpoint':'application/vnd.ms-powerpoint',
      //     'application/vnd.ms-excel':'application/vnd.ms-excel'
      // }

      if (request.files.image.length == undefined) {

        const media = {
          mimeType: request.files.image.mimetype,
          body: bufferToStream(request.files.image.data)
        };
        const file = await drive.files.create({
          resource: {
            name: request.files.image.name,
            'parents': ["19V08sFwBEy9epXg1I5yh9k9T-Ht3tDs4"],
          },
          media: media,
          fields: 'id'
        });

        const result = await drive.files.get({
          fileId: file.data.id,
          fields: 'webViewLink, webContentLink',
        });
        // FileLink.push({link:'https://drive.google.com/file/d/'+file.data.id+'/view'});

        const Attach = await Attachment.create(
          {
            id: file.data.id,
            name: request.files.image.name,
            Link: result.data.webViewLink,
            refDoctype: refDoctype,
            bufferData: request.files.image.data,
            // MimeType:request.files.image[i].mimetype,
            refSeries: refSeries,
            createdBy: request.userName,
            createdAt: new Date(),
          })


        console.log("User (action)  : create new [Attachment]  By : {" + request.userName + "} , Date:" + Date());

        response.status(200).send(Attach)
      }
      else {

        for (var i in request.files.image) {
          const media = {
            mimeType: request.files.image[i].mimetype,
            body: bufferToStream(request.files.image[i].data)
          };
          const file = await drive.files.create({
            resource: {
              name: request.files.image[i].name,
              'parents': ["19V08sFwBEy9epXg1I5yh9k9T-Ht3tDs4"],
            },
            media: media,
            fields: 'id'
          });

          const result = await drive.files.get({
            fileId: file.data.id,
            fields: 'webViewLink, webContentLink',
          });

          const Attach = await Attachment.create(
            {
              id: file.data.id,
              name: request.files.image[i].name,
              Link: result.data.webViewLink,
              refDoctype: refDoctype,
              // MimeType:request.files.image[i].mimetype,
              refSeries: refSeries,
              createdBy: request.userName,
              createdAt: new Date(),
            })
          console.log("User (action)  : create new [Attachment]  By : {" + request.userName + "} , Date:" + Date());

          response.status(200).send(Attach)
        }
      }
    }
    } catch (error) {
      next(new AddingRowException(error, "Attachment"));
      return;
    }

  };
  DownloadAttachment = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {

    try {

      const { Attachment } = request.db.models;

      const { google } = require('googleapis');

     
    const CLIENT_ID = '261832109476-1a09damq8qcni47i3h39eurmdssqt1o9.apps.googleusercontent.com';
    const CLIENT_SECRET = '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';
    const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

    const REFRESH_TOKEN = '1//04_bQFY-mL6lPCgYIARAAGAQSNgF-L9IrJa8A7Y5ONsQZxV_sGAxmINoP03jQq_AjqQGX54akqNG8-maP1C6T7RH1LjzueVGajg'

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


      const fileId = request.params.id;
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      const result = await drive.files.get({
        fileId: fileId,
        fields: 'webViewLink, webContentLink',
      });
      console.log("User (action)  : Download [Attachment]  By : {} , Date:"+Date());
      
      response.status(200).send(result.data.webContentLink)
      // drive.files.get(
      //   {
      //     fileId: fileId,
      //     alt: "media"
      //   },
      //   { responseType: "arraybuffer" },
      //   function (err, { data }) {  
      //             console.log(data);

      //     response.send(JSON.stringify(data))

      //   }
      // );

    } catch (error) {
      
      next(new AddingRowException(error, "Attachment"));
      return;
    }

  };
  ViewAttachment = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {

    try {

      const { Attachment } = request.db.models;

      const { google } = require('googleapis');

      const CLIENT_ID = '261832109476-1a09damq8qcni47i3h39eurmdssqt1o9.apps.googleusercontent.com';
      const CLIENT_SECRET = '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';
      const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

      const REFRESH_TOKEN = '1//04_bQFY-mL6lPCgYIARAAGAQSNgF-L9IrJa8A7Y5ONsQZxV_sGAxmINoP03jQq_AjqQGX54akqNG8-maP1C6T7RH1LjzueVGajg'
  
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


      const fileId = request.params.id;
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      const result = await drive.files.get({
        fileId: fileId,
        fields: 'webViewLink, webContentLink',
      });
      
      response.status(200).send(result.data.webViewLink)

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
    const { Attachment } = request.db.models;
    // let result;
    const { google } = require('googleapis');
    let fileid = request.params.id
    let refSeries = request.params.refSeries



    const CLIENT_ID = '261832109476-1a09damq8qcni47i3h39eurmdssqt1o9.apps.googleusercontent.com';
      const CLIENT_SECRET = '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';
      const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

      const REFRESH_TOKEN = '1//04_bQFY-mL6lPCgYIARAAGAQSNgF-L9IrJa8A7Y5ONsQZxV_sGAxmINoP03jQq_AjqQGX54akqNG8-maP1C6T7RH1LjzueVGajg'
  
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
      const result = await drive.files.delete({
        fileId: fileid,
      });
      await Attachment.destroy({ where: { id: fileid } })
      Attachment.findAll({ where: { refSeries: request.params.refSeries } }).then(data => {
        console.log("User (action)  : delete one  [Attachment]  By : {" + request.userName + "} , Date:" + Date());

        response.status(200).send(data)
      })
    } catch (error) {
      response.status(400).send({
        message:
          error.name || "Some error occurred while Deleting the Attachment."
      });

    }


  }
}

export default AttachmentController;
