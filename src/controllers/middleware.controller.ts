'use strict'

import{ DB } from '../db/db'; 


import * as jwt from 'jsonwebtoken';
import * as SqlString from 'sqlstring';
// get config vars
import * as config from '../config/config';
import * as crypto from 'crypto';

// access config var
//process.env.TOKEN_SECRET;

const algorithm = 'aes-256-cbc'; //Using AES encryption
const key = config.env.CRYPTO_KEY //crypto.randomBytes(32);
const iv = config.env.IV // crypto.randomBytes(16);

//Encrypting text
async function encrypt(text:any) {
  var response = new Promise(async (resolve, reject)=>{
    try{
        let cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        resolve({encryptedData: encrypted.toString('hex')});
        //resolve({ iv: iv, encryptedData: encrypted.toString('hex') });
        //resolve({ iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') });
    } catch(err){
        reject(err);
    }

  });
  return response;

}

//Decrypting text
/*async function decrypt(text:any) {
    var response = new Promise(async (resolve, reject)=>{
      try{
        let iv = Buffer.from(text.iv, 'hex');
        let encryptedText = Buffer.from(text.encryptedData, 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        resolve(decrypted.toString())
        //resolve({ iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') });
      } catch(err){
          reject(err);
      }
  
    });
    return response;
  
  }*/

//module.exports = {
export const Auth = {

    getToken:(email:any, password:any, res:any)=>{
        return new Promise(async (resolve, reject)=>{
            try{ 
                var sql =  SqlString.format(`SELECT u.user_id, u.firstName, u.middleName, u.lastName, u.emailAddr, u.role, p.password 
                FROM users u 
                JOIN password p
                ON p.user_id = u.user_id 
                WHERE u.emailAddr = ?
                AND p.password = ?
                AND p.isActive = 1;`,
                [email, password])
                var result:any = await DB.query(sql); 
                //var sql = SqlString.format(`SELECT u.user_id, u.first_name, u.last_name, u.email, u.role, u.company, u.contact_number, u.photo, p.password FROM users as u JOIN password as p ON p.user_id = u.user_id WHERE u.email = ? AND p.password = ? AND expiry_date > CURDATE() AND isActive = 1 ORDER BY expiry_date DESC LIMIT 1;`, [email, password]);
                //var result:any = await DB.query(sql);

                //var sqlLog = '';
                //var resultLog:any;

                if(!result.length){
                  /*var sqlUser = SqlString.format(`SELECT user_id FROM users WHERE email = ?;`, [email]);
                  var resultUser:any = await DB.query(sqlUser);
                  
                  if(resultUser.length){
                    sqlLog = SqlString.format(`INSERT INTO login_records(user_id, success) VALUES(?,?);`, [resultUser[0].user_id, 0])
                    resultLog = await DB.query(sqlLog);
                  }*/

                  resolve(null);
                } 
                const data = JSON.parse(JSON.stringify(result[0]));
                //console.log(data); 
                const token = jwt.sign(data, config.env.TOKEN_SECRET, { expiresIn: '1d'});  

                /*var sqlPassCount = SqlString.format(`SELECT COUNT(password) as cnt FROM password WHERE user_id = ?;`, [result[0].user_id])
                var resultPassCount:any = await DB.query(sqlPassCount);*/

                console.log(token)
                var encrypted_key:any = await encrypt(token + "___" + result[0].role + "___" + result[0].user_id);

                encrypted_key["firstName"] = result[0].firstName;
                encrypted_key["middleName"] = result[0].middleName;
                encrypted_key["lastName"] = result[0].lastName;
                encrypted_key["emailAddr"] = result[0].emailAddr;
                //encrypted_key["company"] = result[0].company;
                //encrypted_key["contact_number"] = result[0].contact_number;
                //encrypted_key["image_url"] = result[0].photo;
                //encrypted_key["countpass"] = resultPassCount[0].cnt

                //sqlLog = SqlString.format(`INSERT INTO login_records(user_id, success) VALUES(?,?);`, [result[0].user_id, 1])
                //resultLog = await DB.query(sqlLog);

                resolve(encrypted_key)
                /*resolve({
                  firstName: result[0].firstName,
                  middleName: result[0].middleName,
                  lastName: result[0].lastName,
                  emailAddr: result[0].emailAddr,
                  role: result[0].role,
                  token
                })*/

            }catch(err){ 
                reject(err);
            }   
        });
    },

    verifyToken: async(req:any, res:any, next:any) => {
        try{
            const token = req.headers.authorization.split(' ')[1];
            const decoded:any = jwt.verify(
                token,
                config.env.TOKEN_SECRET
            ); 
            //var sql = SqlString.format(`SELECT u.user_id FROM users as u JOIN password as p ON p.user_id = u.user_id WHERE email = ? and password = ?`,[decoded.email,decoded.password])
            //var result:any = await DB.query(sql);
            var sql =  SqlString.format(`SELECT u.user_id, u.firstName, u.middleName, u.lastName, u.emailAddr, u.role, p.password 
            FROM users u 
            JOIN password p
            ON p.user_id = u.user_id 
            WHERE u.emailAddr = ?
            AND p.password = ?
            AND p.isActive = 1;`,
            [decoded.emailAddr, decoded.password])
            var result:any = await DB.query(sql); 
            
            if(!result.length){
                return res.status(401).send({error_message:"Unauthorized"});
            } 
            //req.userData = result[0];
            next();
        } catch (err) {  
            return res.status(401).send({error_message:"Session expired"});
        }
    },


};