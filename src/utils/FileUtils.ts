import * as uuid from 'uuid';

// Create service client module using ES6 syntax.
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
//import imageToBase64 from 'image-to-base64';

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
  
  
  // Send base64 string image to S3
  async storeB64PDF(b64String:any, folderName:any, fileName:any){
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
  }

}
