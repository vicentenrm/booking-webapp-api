import * as config from '../config/config';
import * as uuid from 'uuid';
import e, { Request, Response } from 'express';
import{ DB } from '../db/db'; 
import * as SqlString from 'sqlstring';

export const LocationController = {
  async getLocations(req:Request, res:Response){
    var sql = SqlString.format(`SELECT loc_id, locName
    FROM locations;`, 
    []);
    
    var result:any = await DB.query(sql);

    if(result.length){
      res.status(200).send(result);
    } else{
      res.status(200).send([]);
    }
  }
}