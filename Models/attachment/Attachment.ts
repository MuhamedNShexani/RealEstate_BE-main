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

/* 
filepath which needs to be uploaded
Note: Assumes example.jpg file is in root directory, 
though this can be any filePath
*/
const filePath = path.join(__dirname, 'example.jpg');

async function uploadFile() {
  try {
    
    const response = await drive.files.create({
      requestBody: {
        name: 'download.jpg', //This can be name of your choice
        mimeType: 'image/jpg',
      },
      media: {
        mimeType: 'image/jpg',
        body: fs.createReadStream(filePath),
      },
    });

    console.log(response.data);
  } catch (error) {
    console.log(error.message);
  }
}

uploadFile();

async function deleteFile() {
  try {
    const response = await drive.files.delete({
      fileId: 'YOUR FILE ID',
    });
    console.log(response.data, response.status);
  } catch (error) {
    console.log(error.message);
  }
}

// deleteFile();

async function generatePublicUrl() {
  try {
    const fileId = 'YOUR FILE ID';
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    /* 
    webViewLink: View the file in browser
    webContentLink: Direct download link 
    */
    const result = await drive.files.get({
      fileId: fileId,
      fields: 'webViewLink, webContentLink',
    });
    console.log(result.data);
  } catch (error) {
    console.log(error.message);
  }
}

// generatePublicUrl();