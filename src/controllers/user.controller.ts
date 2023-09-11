import * as config from '../config/config';
import * as uuid from 'uuid';
import e, { Request, Response } from 'express';
import{ DB } from '../db/db'; 
import * as SqlString from 'sqlstring';
import { Auth } from './middleware.controller';

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
  }
}

