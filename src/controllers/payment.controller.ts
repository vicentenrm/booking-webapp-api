'use strict'

import * as config from '../config/config';
import * as uuid from 'uuid';
import e, { Request, Response } from 'express';
//import fetch from 'node-fetch';
const axios = require('axios');
var sdk:any = require("paymaya-node-sdk");
//import * as sdk from 'paymaya-node-sdk';

//var callback = function(err:any, response:any) {
//  if(err) {
//     console.log(err);
//     return;
//  }
//  console.log(JSON.stringify(response));
//
//};

async function callback(err:any, response:any){
  const resp = await new Promise((resolve, reject) => {
    if(err){
      console.log(err);
      reject();
    }
    console.log(JSON.stringify(response));
    resolve(response)
  });
  return resp;
}

var PaymayaSDK = sdk.PaymayaSDK;
PaymayaSDK.initCheckout(
  config.env.MAYA_PK, // 'pk-TnpIh5X432Qw1DJLlMhzxRhBN4fvUp3SHPuHT3m5wv6',
  config.env.MAYA_SK, // 'sk-SNCvnXbvtAxU6mszPMoDl2M1d4e1ivko1E6PLGiOiqm',
  PaymayaSDK.ENVIRONMENT.SANDBOX
);

var Customization = sdk.Customization;
var customization = new Customization();

customization.logoUrl = "https://cdn.paymaya.com/production/checkout_api/customization_example/yourlogo.svg";
customization.iconUrl = "https://cdn.paymaya.com/production/checkout_api/customization_example/youricon.ico";
customization.appleTouchIconUrl = "https://cdn.paymaya.com/production/checkout_api/customization_example/youricon_ios.ico";
customization.customTitle = "Checkout Page Title";
customization.colorScheme = "#368d5c";

customization.set(callback);

customization.get(callback);

//customization.remove(callback);

var Webhook = sdk.Webhook;
var webhook = new Webhook();

var Checkout = sdk.Checkout;
var Contact = sdk.Contact;
var Address = sdk.Address;
var Buyer = sdk.Buyer;
var ItemAmountDetails = sdk.ItemAmountDetails;
var ItemAmount = sdk.ItemAmount;
var Item = sdk.Item;

//var checkout = new Checkout();
//var contact = new Contact();
//var address = new Address();
//var buyer = new Buyer();
//var itemAmountDetails = new ItemAmountDetails();
//var itemAmount = new ItemAmount();
//var item:any = new Item();

export const PaymentController = {

  async checkout(req:Request, res:Response){

    var ref_num = uuid.v4();

    /*
     *  SAMPLE REQUEST BODY 
     * 
      
      var addressOptions:any = {
          line1 : "9F Robinsons Cybergate 3",
          line2 : "Pioneer Street",
          city : "Mandaluyong City",
          state : "Metro Manila",
          zipCode : "12345",
          countryCode : "PH"
      };
      
      var contactOptions:any = {
         phone : "+63(2)1234567890",
         email : "paymayabuyer1@gmail.com"
      };
      
      var buyerOptions:any = {
        firstName : "John",
        middleName : "Michaels",
        lastName : "Doe"
      };
      
      var itemAmountDetailsOptions:any = {
      	shippingFee: "14.00",
      	tax: "5.00",
      	subTotal: "50.00" 
      };
      
      var itemAmountOptions:any = {
      	currency: "PHP",
      	value: "69.00"
      };
      
      var itemOptions:any = {
      	name: "Leather Belt",
      	code: "pm_belt",
      	description: "Medium-sv"
      };
    
     *
     *
     */
    
    /*
     *
     * 
     //[REORGANIZED]
    
      var buyerInfo = {
        firstName : "John",
        middleName : "Michaels",
        lastName : "Doe",
        contact: {
          phone : "+63(2)1234567890",
          email : "paymayabuyer1@gmail.com"
        },
        shippingAddress: {
          line1 : "9F Robinsons Cybergate 3",
          line2 : "Pioneer Street",
          city : "Mandaluyong City",
          state : "Metro Manila",
          zipCode : "12345",
          countryCode : "PH"
        },
        billingAddress: {
          line1 : "9F Robinsons Cybergate 3",
          line2 : "Pioneer Street",
          city : "Mandaluyong City",
          state : "Metro Manila",
          zipCode : "12345",
          countryCode : "PH"
        }
      }
    
      var itemInfo = {
        name: "Leather Belt",
        code: "pm_belt",
        description: "Medium-sv",
        amount: {
      	currency: "PHP",
      	value: "69.00",
         details: {
           shippingFee: "14.00",
           tax: "5.00",
           subTotal: "50.00" 
         }
        },
        totalAmount: {
      	currency: "PHP",
      	value: "69.00",
         details: {
           shippingFee: "14.00",
      	  tax: "5.00",
      	  subTotal: "50.00" 
         }
        }
      }
    
     *
     * 
     */
    
    // Add all items here
    //var items:any = [];
    //items.push(itemInfo);
    
    var data = req.body;
    //TODO create dummy totalAmount
    var val = 0.00;
    var sFee = 0.00;
    var tx = 0.00;
    var subTot = 0.00;
    for(let item in data.items){
      console.log(data.items[item].totalAmount);
      val += data.items[item].totalAmount.value;
      //sFee += data.items[item].totalAmount.details.shippingFee;
      //tx += data.items[item].totalAmount.details.tax;
      //subTot +=  data.items[item].totalAmount.details.subTotal;
    }
    var totalAmount = {
      currency: "PHP",
      value: val,
       details: {
        shippingFee: sFee,
        tax: tx,
        subTotal: subTot 
       }
    }

    var checkout = new Checkout();
    checkout.buyer = data.buyerInfo; //buyerInfo; // buyer;
    checkout.totalAmount = totalAmount; // data.items[0].totalAmount; // itemInfo.totalAmount; // itemOptions.totalAmount;
    checkout.requestReferenceNumber = ref_num;
    checkout.items = data.items; // items;
    
    checkout.execute(function (error:any, response:any) {
        if (error) {
          // handle error
        } else {
          // track response.checkoutId
          // redirect to response.redirectUrl
    	  console.log(response);
          res.status(200).send(response);
        }
    });
    
    //console.log(checkout.retrieve(callback));
  },

  async getPaymentStatus(req:Request, res:Response){
    var checkoutId = req.body.checkoutId;
  
    var base64key = Buffer.from(config.env.MAYA_PK + ':').toString('base64');
    console.log(base64key);

    const options = {
      method: 'GET',
      url: 'https://pg-sandbox.paymaya.com/payments/v1/payments/' + checkoutId + '/status',
      headers: {
        accept: 'application/json',
        authorization: 'Basic ' + base64key //cGstTkNMazdKZURiWDFtMjJaUk1EWU85YkVQb3dOV1Q1SjRhTklLSWJjVHkyYTo='
      }
    };
    
    axios
      .request(options)
      .then(function (response: any) {
        console.log(response.data);
        res.status(200).send({'status': response.data.status});
      })
      .catch(function (error: string) {
        console.error(error);
      });

  },

  async createWebhook(req:Request, res:Response){
    var name = req.body.name;
    webhook.name = name;
    var callbackURL = req.body.callbackURL;
    webhook.callbackUrl = callbackURL;

    webhook.register(callback);
    //
    //webhook.retrieve(callback);
    //
    //webhook.name = "CHECKOUT_SUCCESS"; // it can be CHECKOUT_SUCCESS or CHECKOUT_FAILURE
    //webhook.callbackUrl = "http://shop.someserver.com/success_update";
    //
    //webhook.update(callback);
    //
    //webhook.delete(callback);

    res.status(200).send({})    
  },

  async getWebhooks(req:Request, res:Response){
    webhook.retrieve(callback);
    res.status(200).send({});
  },

  async statusWebhook(req:Request, res:Response){
    console.log(req.body);
    var checkoutId = req.body.id;
    var status = req.body.status;
    var source = '';
    if(req.body.fundSource){
      source = req.body.fundSource.type? req.body.fundSource.type : '';
    } else{
      source = '';
    }
    var currency = req.body.currency;
    var amount = req.body.amount;
    var description = req.body.description;
    var paydate = req.body.updatedAt;
    
    var webhooks:any = await webhook.retrieve(callback);
    console.log("YYY: ", webhooks)
    var webhook_callbacks:any = {};
    for(let wh in webhooks){
      webhook_callbacks[webhooks[wh].name] = {
        callbackURL: webhooks[wh].callbackUrl,
        createdAt: webhooks[wh].createdAt,
        updatedAt: webhooks[wh].updatedAt
      }
    }

    console.log("ZZZ: ", webhook_callbacks)

    if(status === "PAYMENT_SUCCESS"){
      res.status(200).send({
        success: true,
        status: "PAYMENT_SUCCESS",
        source: source,
        callbackURL: webhook_callbacks[status] ? webhook_callbacks[status].callbackURL : ''
      });
    } else if(status === "AUTHORIZED"){
      res.status(200).send({
        success: true,
        status: "AUTHORIZED",
        source: source,
        callbackURL: webhook_callbacks[status] ? webhook_callbacks[status].callbackURL : ''
      });
    } else if(status === "PAYMENT_FAILED"){
      res.status(200).send({
        success: true,
        status: "PAYMENT_FAILED",
        source: source,
        callbackURL: webhook_callbacks[status] ? webhook_callbacks[status].callbackURL : ''
      });
    } else if(status === "PAYMENT_EXPIRED"){
      res.status(200).send({
        success: true,
        status: "PAYMENT_EXPIRED",
        callbackURL: webhook_callbacks[status] ? webhook_callbacks[status].callbackURL : ''
      });
    } else if(status === "PAYMENT_CANCELLED"){
      res.status(200).send({
        success: true,
        status: "PAYMENT_CANCELLED",
        callbackURL: webhook_callbacks[status] ? webhook_callbacks[status].callbackURL : ''
      });
    }
  }
};
