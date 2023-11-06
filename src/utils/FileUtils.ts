import * as uuid from 'uuid';

// Create service client module using ES6 syntax.
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
//import imageToBase64 from 'image-to-base64';
const axios = require('axios');
import * as config from '../config/config';

// Set the AWS Region.
const REGION = "ap-southeast-1";
// Create an Amazon S3 service client object.
//const s3Client = new S3Client({ region: REGION });
var credentials = {
  accessKeyId: config.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.env.AWS_SECRET_ACCESS_KEY
}
const s3Client =new S3Client({
  region: REGION,
  credentials: credentials
})

export const FileUtils = {
  
  
  // Send base64 string video to S3
  async storeFile(b64String:any, folderName:any, fileName:any){
    const response = await new Promise(async (resolve, reject) => {
      //var buf = Buffer.from(b64String.replace(/^data:image\/\w+;base64,/, ""),'base64')
      var buf = Buffer.from(b64String.split('base64,')[1],'base64')
      var fname = fileName; //uuid.v4(); // without file extension 
      var key = '';
      if(!folderName){
        key += fname;    
      } else{
        key += folderName + "/" + fname;  
      }
      const params = {
        Bucket: "rti-elem-attendance",
        Key: key, // req.body.filename,
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: 'video/mp4'
      };
  
      try {
        const data = await s3Client.send(new PutObjectCommand(params));
        resolve("https://rti-elem-attendance.s3.ap-southeast-1.amazonaws.com/" + key); // req.body.filename});
      } catch (err) {
        resolve(null)
        console.log("Error", err);
      }
  
    });
    return response;
  },

  // Convert video from URL to base64 string
  async urlToB64(url:any){
    const response = await new Promise(async (resolve, reject) => {
      

      //const downloadFile = async (url:any, path:any) => {
        try {
          const response = await axios({
            method: "GET",
            url: url,
            responseType: "stream",
          });
          // Do something with the response
          resolve(response)
        } catch (err) {
          // Handling errors
          console.log(err);
        }
      //};


/*//const fs = require('fs');
const path = require('path');
//const axios = require('axios').default;

// fileUrl: the absolute url of the image or video you want to download
// downloadFolder: the path of the downloaded file on your machine
const downloadFile = async (fileUrl, downloadFolder) => {
  // Get the file name
  const fileName = path.basename(fileUrl);

  // The path of the downloaded file on our machine
  const localFilePath = path.resolve(__dirname, downloadFolder, fileName);
  try {
    const response = await axios({
      method: 'GET',
      url: fileUrl,
      responseType: 'stream',
    });

    const w = response.data.pipe(fs.createWriteStream(localFilePath));
    w.on('finish', () => {
      console.log('Successfully downloaded file!');
    });
  } catch (err) { 
    throw new Error(err);
  }
}; */
/*
// Testing
const IMAGE_URL =
  'https://www.kindacode.com/wp-content/uploads/2021/01/test.jpg';
downloadFile(IMAGE_URL, 'download');

const VIDEO_URL =
  'https://www.kindacode.com/wp-content/uploads/2021/01/example.mp4';
downloadFile(VIDEO_URL, 'download');




*/



      /*try {
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
        });
    
        const contentType = response.headers['content-type'];
    
        const base64String = `data:${contentType};base64,${Buffer.from(
          response.data,
        ).toString('base64')}`;
    
        resolve(base64String);
      } catch (err) {
        console.log(err);
      }*/


    });
    return response;
  }

}
