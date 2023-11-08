import * as config from '../config/config';
import * as uuid from 'uuid';
import e, { Request, Response } from 'express';
import{ DB } from '../db/db'; 
import * as SqlString from 'sqlstring';
import { Auth } from './middleware.controller';
import { CodeUtils } from '../utils/CodeUtils';
import { EmailUtils } from '../utils/email_sender';

export const UserController = {

  async login(req:Request, res:Response){
    const email= req.body.email;
    const pass = req.body.password;

    const response:any = await Auth.getToken(email, pass, res);

    if(response == null){
        res.status(401).send({"encryptedData": response});
    } else{
        res.status(200).send(response);
    }

    /*var sqlLogin =  SqlString.format(`SELECT * FROM customers c 
    JOIN password p
    WHERE c.emailAddr = ?
    AND p.password = ?;`, 
    [email, pass])

    var resLogin:any = await DB.query(sqlLogin);

    if(resLogin.length){
      res.status(200).send({success: true});
    } else{
      res.status(400).send({success: false});
    }*/
  },

  async requestChangePass(req:Request, res:Response){
    const email = req.body.emailAddr;

    // Check if email address provided is in the users database
    var sqlCheck = SqlString.format(`SELECT emailAddr FROM users
    WHERE emailAddr = ?;`, [email]);
    var resultCheck:any = await DB.query(sqlCheck);

    if(resultCheck.length){
      // Generate and store code
      const code = await CodeUtils.genCode(8);
      var sql = SqlString.format(`UPDATE users SET changePassCode = ? WHERE emailAddr = ?;`, [code, email]);
      var result = await DB.query(sql);

      // Send Change Password Email
      var sqlUser = SqlString.format(`SELECT firstName, middleName, lastName, role
      FROM users
      WHERE emailAddr = ?;`,
      [email]);
      var resultUser:any = await DB.query(sqlUser);

      var full_name = resultUser.firstName + ' ' + resultUser.middleName + ' ' + resultUser.lastName;
      var subject = 'Password Reset';
      var attachments = null;
      var email_body = `
      <body
        style="
          font-family: 'Montserrat', sans-serif;
          margin-left: auto;
          margin-right: auto;
          margin-top: 2rem;
          margin-bottom: 2rem;
          box-shadow: 3px 8px 12px rgba(0, 0, 0, 0.3);
          border-radius: 20px;
          transition: all 0.3s;
          padding-bottom: 2px;
          width: 60%;
          height: 300px;
          background-color: #f2f2f2;
        "
      >
        <table 
          style="
            background-color: #c8ffff;
            width: 100%;
            padding: 1rem;
            border-top-left-radius:20px;
            border-top-right-radius:20px;
            table-layout: fixed;
          "
        >
          <tbody>
            <tr>
              <td style="
                  width=50%;
                "
              >
                <table>
                
                
                  <tbody>
                    <tr>
                      <td>
                        <h1>GREETINGS PH</h1>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h3>&ltinsert tagline&gt</h3>
                      </td>
                    </tr>
                  </tbody>
                
                
                </table>
              </td>
    
              <td style="
                  width=50%;
                  text-align:right;
                "
              >
                <img 
                 style="
                   width:25%;
                   height:25%;
                 "
                 src="https://rti-lrmc.s3.ap-southeast-1.amazonaws.com/Retailgate+logo-circle.png">
                </img>
              </td>
            </tr>
          </tbody>
        </table>
        
        <table
          style="
            background-color: #f2f2f2;
            width: 100%;
            padding: 1rem;
          "
        >
          <tbody>
            <tr>
              <td>
                <p>Hello ` + resultUser[0].firstName + `,</p>
                <p style="text-indent:1rem;"> A password reset code is provided below. Ignore this email if you didn't request for password reset.</p>
                <h1 style="text-align:center;">` + code + `</h1>
              </td>
            </tr>
    
          </tbody>
        </table>  
      </body>
      `;
  
      EmailUtils.sendEmailMS(email, full_name, subject, email_body, attachments);

      res.status(200).send({"success": true});
    } else{ 
      res.status(400).send({"error": "No account associated with the email address you provided."});
    }
  },

  async confirmChangePassCode(req:Request, res:Response){
    const emailAddr = req.body.emailAddr;
    const code = req.body.code;

    var sqlCode = SqlString.format(`SELECT changePassCode
    FROM users
    WHERE emailAddr = ?;`, 
    [emailAddr]);

    var resultCode:any = await DB.query(sqlCode);

    if(resultCode.length){
      if(code === resultCode[0].changePassCode){
        res.status(200).send({success: true});
      }
    } else{
      res.status(200).send({success: false});
    }
  },

  async saveNewPassword(req:Request, res:Response){
    const emailAddr = req.body.emailAddr;
    const newpass = req.body.newpass;

    var sqlUpdatePass = SqlString.format(`UPDATE password SET password = ?
    WHERE user_id IN (SELECT user_id FROM users WHERE emailAddr = ?);`,
    [newpass, emailAddr]);

    var resultUpdatePass:any = await DB.query(sqlUpdatePass);

    res.status(200).send({success: true});
  }
}

