'use strict'

import * as config from '../config/config';
import * as uuid from 'uuid';
import e, { Request, Response } from 'express';
import{ DB } from '../db/db'; 
import * as SqlString from 'sqlstring';
import moment from 'moment';
import { FileUtils } from '../utils/FileUtils'
import { EmailUtils } from '../utils/email_sender';

import * as fs from 'fs';
//import fetch from 'node-fetch';
const axios = require('axios');
var sdk:any = require("paymaya-node-sdk");
//import * as sdk from 'paymaya-node-sdk';
const sdk2:any = require('api')('@paymaya/v5.18#3kztl4pdq51t');


// callback function for maya api integration
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

// Initialize Maya SDK with public key and secret key 
var PaymayaSDK = sdk.PaymayaSDK;
PaymayaSDK.initCheckout(
  config.env.MAYA_PK, // 'pk-TnpIh5X432Qw1DJLlMhzxRhBN4fvUp3SHPuHT3m5wv6',
  config.env.MAYA_SK, // 'sk-SNCvnXbvtAxU6mszPMoDl2M1d4e1ivko1E6PLGiOiqm',
  PaymayaSDK.ENVIRONMENT.PRODUCTION //PaymayaSDK.ENVIRONMENT.SANDBOX
  
);

// Initialize Maya checkout page customization
var Customization = sdk.Customization;
var customization = new Customization();

// Customize checkout page
customization.logoUrl = "https://google.com/"; //"https://cdn.paymaya.com/production/checkout_api/customization_example/yourlogo.svg";
customization.iconUrl = "https://google.com/"; //"https://cdn.paymaya.com/production/checkout_api/customization_example/youricon.ico";
customization.appleTouchIconUrl = "https://google.com/"; //"https://cdn.paymaya.com/production/checkout_api/customization_example/youricon_ios.ico";
customization.customTitle = "TITLE";
customization.colorScheme = "#368d5c";

customization.set(callback);

customization.get(callback);

//customization.remove(callback);

// 
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

  // Request maya checkout transaction
  async checkout(req:Request, res:Response){
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
    
    var refNo = req.body.refNo;
    console.log(refNo);

    // TODO
    // Check if there's an existing maya checkout ID for the refNo

    var sql = SqlString.format(`SELECT c.firstName, c.middleName, c.lastName, c.emailAddr,
    b.checkoutID, b.checkoutURL, 
    bi.productName, bi.spots, bi.totalAmount, bi.status
    FROM booking_items bi 
    JOIN bookings b ON b.book_id = bi.book_id
    JOIN customers c ON b.cus_id = c.cus_id
    WHERE b.refNo = ?;`, 
    [refNo]);

    var result:any = await DB.query(sql);

    if(result[0].checkoutID && result[0].status != "Paid" && result[0].status != "Payment Failed" && result[0].status != "Payment Expired" && result[0].status != "Payment Error"){
      res.status(200).send({
        checkoutId: result[0].checkoutID,
        redirectUrl: result[0].checkoutURL        
      });
    } else{
    if(result[0].status != "Paid" && result[0].status != "Payment Failed"){
      var units = 128;
      var data:any = {
        buyerInfo: {
          firstName: result[0].firstName,
          middleName: result[0].middleName,
          lastName: result[0].lastName,
          contact: {
            email: result[0].emailAddr
          }
        },
        items: [
          
        ]
      };
  
      for(let row in result){
        data["items"].push({
          name: result[row].productName,
          totalAmount: {
            value: result[row].totalAmount // * units
          }
        });
      }
  
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
  
      var redirectUrl = {
        success: config.env.BASE_URL + "checkout/success/?refno=" + refNo, 
        failure: config.env.BASE_URL + "checkout/failed/?refno=" + refNo, 
        cancel: config.env.BASE_URL, 
      }
  
      var checkout = new Checkout();
      checkout.buyer = data.buyerInfo; 
      checkout.totalAmount = totalAmount; 
      checkout.requestReferenceNumber = refNo; 
      checkout.items = data.items; 
      checkout.redirectUrl = redirectUrl;
      
      checkout.execute(async function (error:any, response:any) {
          if (error) {
            // handle error
          } else {
            // track response.checkoutId
            // redirect to response.redirectUrl
      	    console.log(response);
            var sqlUpd = SqlString.format(`UPDATE bookings SET checkoutID = ?, checkoutURL = ? WHERE refNo = ?;`, 
            [response.checkoutId, response.redirectUrl, refNo]);
            var resultUpd:any = await DB.query(sqlUpd);

            // Update status in case it became Payment Expired and requested for new Checkout ID
            var sqlStatus = SqlString.format(`UPDATE booking_items SET status = "Approved" WHERE book_id IN (SELECT book_id FROM bookings WHERE refNo = ?);`,
            [refNo]);
            var resultStatus:any = await DB.query(sqlStatus);

            res.status(200).send(response);
          }
      });

    //}
    } else if(result[0].status == "Paid"){
      res.status(200).send({
        status: "paid"
      })
    } else if(result[0].status == "Payment Failed"){
      res.status(200).send({
        status: "failed"
      })
    }
    }
    //console.log(checkout.retrieve(callback));
  },

  // Get payment status
  async getPaymentStatus(req:Request, res:Response){
    var checkoutId = req.body.checkoutId;
  
    var base64key = Buffer.from(config.env.MAYA_PK + ':').toString('base64');
    console.log(base64key);

    const options = {
      method: 'GET',
      url: 'https://pg-sandbox.paymaya.com/payments/v1/payments/' + checkoutId + '/status',
      headers: {
        accept: 'application/json',
        authorization: 'Basic ' + base64key
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

  // Creating webhook
  async createWebhook(req:Request, res:Response){
    var name = req.body.name;
    webhook.name = name;
    var callbackURL = req.body.callbackURL;
    webhook.callbackUrl = callbackURL;

    webhook.register(callback);

    res.status(200).send({})    
  },

  // Getting list of created Maya webhooks
  async getWebhooks(req:Request, res:Response){
    webhook.retrieve(callback);
    res.status(200).send({});
  },

  // Get payment status
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
  },

  // Add customer booking for approval
  async addBooking(req:Request, res:Response){
    var data = req.body;

    var val = 0.00;
    var sFee = 0.00;
    var tx = 0.00;
    var subTot = 0.00;
    for(let item in data.items){
      val += data.items[item].totalAmount.value;
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

    var spots = 0;
    if(data.tier == 1){
      spots = 63;
    } else if(data.tier == 2){
      spots = 127;
    } else if(data.tier == 3){
      spots = 225;
    }

    // Check if customer email address already exists
    var sqlCheck = SqlString.format(`SELECT * FROM customers WHERE emailAddr = ?;`, [data.buyerInfo.contact.email]);
    var resultCheck:any = await DB.query(sqlCheck);

    var sqlCus = '';
    var sqlBooks = '';
    var sqlBookItems = '';
    var book_id = uuid.v4();
    var bookitem_id = '';
    var ref_num = uuid.v4();
    var mat:any = '';
    if(resultCheck.length){
      // Update customer details
      sqlCus = SqlString.format(`UPDATE customers SET firstName = ?, middleName = ?, lastName = ?, contactNo = ? WHERE emailAddr = ?;`, 
      [data.buyerInfo.firstName, data.buyerInfo.middleName, data.buyerInfo.lastName, data.buyerInfo.contact.phone, data.buyerInfo.contact.email]);

      // Insert booking
      sqlBooks = SqlString.format(`INSERT INTO bookings(book_id, cus_id, refNo) VALUES(?, ?, ?);`, 
      [book_id, resultCheck[0].cus_id, ref_num]);

      // Insert booking items
      for(let item in data.items){
        bookitem_id = uuid.v4();

        console.log("Booked date: ", moment(data.items[item].bookedDate).format("YYYY-MM-DD"));
        mat = await FileUtils.storeFile(data.materialFile, "_", "mat_" + bookitem_id + "_" + moment(data.items[item].bookedDate).format().split('T')[0]);

        sqlBookItems += SqlString.format(`INSERT INTO booking_items(bookitem_id, book_id, productName, loc_id, tier, spots, totalAmount, booked_date, status, materialURL) VALUES(?,?,?,?,?,?,?,?,?,?);`, 
        [bookitem_id, book_id, data.items[item].name, data.loc_id, data.tier, spots, data.items[item].totalAmount.value, moment(data.items[item].bookedDate).format(), 'Pending Booking', mat])
      }

    } else{
      // Insert customer details
      const cus_id = uuid.v4();
      sqlCus = SqlString.format(`INSERT INTO customers(cus_id, firstName, middleName, lastName, contactNo, emailAddr) VALUES(?, ?, ?, ?, ?, ?)`, 
      [cus_id, data.buyerInfo.firstName, data.buyerInfo.middleName, data.buyerInfo.lastName, data.buyerInfo.contact.phone, data.buyerInfo.contact.email]);

      // Insert booking
      sqlBooks = SqlString.format(`INSERT INTO bookings(book_id, cus_id, refNo) VALUES(?, ?, ?);`, 
      [book_id, cus_id, ref_num]);

      // Insert booking items
      for(let item in data.items){
        bookitem_id = uuid.v4();

        mat = await FileUtils.storeFile(data.materialFile, "_", "mat_" + bookitem_id + "_" + moment(data.items[item].bookedDate).format().split('T')[0]);

        sqlBookItems += SqlString.format(`INSERT INTO booking_items(bookitem_id, book_id, productName, loc_id, tier, spots, totalAmount, booked_date, status, materialURL) VALUES(?,?,?,?,?,?,?,?,?,?);`, 
        [bookitem_id, book_id, data.items[item].name, data.loc_id, data.tier, spots, data.items[item].totalAmount.value, moment(data.items[item].bookedDate).format(), 'Pending Booking', mat]);
      }
    }

    var resultCus:any = await DB.query(sqlCus);
    var resultBooks:any = await DB.query(sqlBooks);
    var resultBookItems:any = await DB.query(sqlBookItems);

    // Send confirmation email to customer
    var cus_email_addr = data.buyerInfo.contact.email; 
    var cus_full_name = data.buyerInfo.firstName + ' ' + data.buyerInfo.middleName + ' ' + data.buyerInfo.lastName;
    var cus_subject = 'Booking Request';
    var cus_attachments = null;
    var cus_email_body = `
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
        height: auto;
        background-color: #f2f2f2;
      "
    >
      <table 
        style="
          background-color: #1670DF;
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
                      <h1 style="
                          color: #ffffff;
                          font-size: 24px;
                          letter-spacing: 1px;
                          padding: 0;
                          margin: 8px 0;
                        "
                      >TITLE</h1>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <h3 style="
                          text-align: left;
                          color: #ffffff;
                        "
                      ></h3>
                    </td>
                  </tr>
                </tbody>
              
              
              </table>
            </td>
    
            <td style="
                margin: auto;
                align-items: right;
                justify-content: right;
                text-align: right;
                padding-right: 16px;
              "
            >
              <img 
               style="
                 width: 26%;
                 height: 67%;
               "
               src="https://google.com/">
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
              <p style="
                  text-align: left;
                  font-size: 15px;
                  padding: 0 16px;
                  text-indent:0
                "
              >Hello ` + data.buyerInfo.firstName + `,</p>
              <p style="
                  text-align: left;
                  font-size: 15px;
                  padding: 0 16px;
                  text-indent:0
                "
              > We received your booking request. Please give us ample time to review your material. We'll let you know right away once your booking is approved. You may visit <a href="` + config.env.BASE_URL + `bookstatus/?refno=` + ref_num +`">Booking Tracker</a> to check the status of your booking.</p>
            </td>
          </tr>
  
        </tbody>
      </table>  
    </body>
    `;

    EmailUtils.sendEmailMS(cus_email_addr, cus_full_name, cus_subject, cus_email_body, cus_attachments);

    var sqlAdmin = SqlString.format(`SELECT firstName, middleName, lastName, emailAddr
    FROM users
    WHERE role = "admin";`, 
    []);

    var resultAdmin:any = await DB.query(sqlAdmin);

    // Send email to Reviewer
    var email_addr = resultAdmin[0].emailAddr; 
    var full_name = resultAdmin[0].firstName + ' ' + resultAdmin[0].middleName + ' ' + resultAdmin[0].lastName;
    var subject = 'Booking Request';
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
        height: auto;
        background-color: #f2f2f2;
      "
    >
      <table 
        style="
          background-color: #1670DF;
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
                      <h1 style="
                          color: #ffffff;
                          font-size: 24px;
                          letter-spacing: 1px;
                          padding: 0;
                          margin: 8px 0;
                        "
                      >TITLE</h1>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <h3 style="
                          text-align: left;
                          color: #ffffff;
                        "
                      ></h3>
                    </td>
                  </tr>
                </tbody>
              
              
              </table>
            </td>
    
            <td style="
                margin: auto;
                align-items: right;
                justify-content: right;
                text-align: right;
                padding-right: 16px;
              "
            >
              <img 
               style="
                 width: 26%;
                 height: 67%;
               "
               src="https://google.com/">
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
              <p style="
                  text-align: left;
                  font-size: 15px;
                  padding: 0 16px;
                  text-indent:0
                "
              >Hello ` + resultAdmin[0].firstName + `,</p>
              <p style="
                  text-align: left;
                  font-size: 15px;
                  padding: 0 16px;
                  text-indent:0
                "
              > A new booking request has been received. See the material here: <a href="` + config.env.BASE_URL + `pendingbookings">Dashboard</a> for your review and approval.</p>
            </td>
          </tr>
  
        </tbody>
      </table>  
    </body>
    `;

    EmailUtils.sendEmailMS(email_addr, full_name, subject, email_body, attachments);

    
    res.status(200).send({refNo: ref_num});
  },

  //
  async getBooking(req:Request, res:Response){
    var refNo = req.body.refNo;

    var sql = SqlString.format(`SELECT c.firstName, c.middleName, c.lastName, c.emailAddr, 
    bi.productName, bi.totalAmount 
    FROM booking_items bi 
    JOIN bookings b ON b.book_id = bi.book_id
    JOIN customers c ON b.cus_id = c.cus_id
    WHERE b.refNo = ?;`, 
    [refNo]);

    var result:any = await DB.query(sql);

    var data:any = {
      buyerInfo: {
        firstName: result[0].firstName,
        middleName: result[0].middleName,
        lastName: result[0].lastName,
        contact: {
          email: result[0].emailAddr
        }
      },
      items: [
        
      ]
    };

    for(let row in result){
      data["items"].push({
        name: result[row].productName,
        totalAmount: {
          value: result[row].totalAmount
        }
      });
    }

    res.status(200).send(data);
  },

  // Get list of bookings
  async getBookings(req:Request, res:Response){
    var role = req.body.role;
    var sql = '';
    if(role === "ADMIN"){
      sql += SqlString.format(`SELECT c.firstName, c.middleName, c.lastName, c.contactNo, c.emailAddr,
      b.refNo, b.created_at,
      bi.productName, bi.totalAmount, bi.booked_date, bi.status, bi.materialURL,
      l.locName 
      FROM booking_items bi 
      JOIN bookings b ON b.book_id = bi.book_id
      JOIN locations l on l.loc_id = bi.loc_id
      JOIN customers c ON b.cus_id = c.cus_id
      WHERE status NOT IN ("Cancelled", "Expired")
      ORDER BY b.created_at;`, 
      []);
    } else if(role === "APPROVER"){
      sql += SqlString.format(`SELECT c.firstName, c.middleName, c.lastName, c.contactNo, c.emailAddr,
      b.refNo, b.created_at,
      bi.productName, bi.totalAmount, bi.booked_date, bi.status, bi.materialURL,
      l.locName 
      FROM booking_items bi 
      JOIN bookings b ON b.book_id = bi.book_id
      JOIN locations l on l.loc_id = bi.loc_id
      JOIN customers c ON b.cus_id = c.cus_id
      WHERE status IN ("APPROVED", "REVIEWED", "PAID", "Rejected", "Payment Failed")
      ORDER BY b.created_at;`, 
      []);
    }

    var result:any = await DB.query(sql);

    var data:any = [];
    var queue_stat = '';
    var booking_cnt:any = {}
    for(let row in result){
      // Check booking count for given location on given date
      if(result[row].status != "Payment Failed" && result[row].status != "Rejected"){
        if(Object.keys(booking_cnt).includes(result[row].locName)){
          if(Object.keys(booking_cnt[result[row].locName]).includes(moment(result[row].booked_date).format("YYYY-MM-DD"))){
            if(booking_cnt[result[row].locName][moment(result[row].booked_date).format("YYYY-MM-DD")] >= 3){
              queue_stat = "Waitlisted";
            } else{
              queue_stat = "Open";
              booking_cnt[result[row].locName][moment(result[row].booked_date).format("YYYY-MM-DD")] += 1;
            }
          } else {
            booking_cnt[result[row].locName][moment(result[row].booked_date).format("YYYY-MM-DD")] = 1;
            queue_stat = "Open";
          } 
        } else {
          booking_cnt[result[row].locName] = {};
          booking_cnt[result[row].locName][moment(result[row].booked_date).format("YYYY-MM-DD")] = 1;
          queue_stat = "Open";
        }
      } else if (result[row].status == "Rejected"){
        queue_stat = "Rejected";
      } else{
        queue_stat = "Failed";
      }

      data.push({
        firstName: result[row].firstName,
        middleName: result[row].middleName,
        lastName: result[row].lastName,
        contactNo: result[row].contactNo,
        emailAddr: result[row].emailAddr,
        refNo: result[row].refNo,
        booking_date: moment(result[row].created_at).format("YYYY-MM-DD HH:mm:ss"),
        productName: result[row].productName,
        totalAmount: result[row].totalAmount,
        booked_date: moment(result[row].booked_date).format("YYYY-MM-DD"),
        status: result[row].status,
        materialURL: result[row].materialURL,
        locName: result[row].locName,
        queue_stat
      });
    }

    res.status(200).send(data);
  },

  // Get booking details by provided reference number // For Material Viewing
  async getBookDetails(req:Request, res:Response){
    var sql = SqlString.format(`SELECT c.firstName, c.middleName, c.lastName, c.contactNo, c.emailAddr,
    b.refNo, b.created_at,
    bi.productName, bi.totalAmount, bi.booked_date, bi.status, bi.materialURL,
    l.locName 
    FROM booking_items bi 
    JOIN bookings b ON b.book_id = bi.book_id
    JOIN locations l on l.loc_id = bi.loc_id
    JOIN customers c ON b.cus_id = c.cus_id
    WHERE status != "Cancelled"
    AND b.refNo = ?;`, 
    [req.body.refNo]);

    var result:any = await DB.query(sql);

    res.status(200).send({
      firstName: result[0].firstName,
      middleName: result[0].middleName,
      lastName: result[0].lastName,
      contactNo: result[0].contactNo,
      emailAddr: result[0].emailAddr,
      refNo: result[0].refNo,
      booking_date: result[0].created_at,
      productName: result[0].productName,
      totalAmount: result[0].totalAmount,
      booked_date: moment(result[0].booked_date).format("YYYY-MM-DD"),
      status: result[0].status,
      materialURL: result[0].materialURL,
      locName: result[0].locName
    });
  },

  // Get booking details by provided reference number // For Customer Booking Tracker
  async getBookTracking(req:Request, res:Response){
    var sql = SqlString.format(`SELECT c.firstName, c.middleName, c.lastName, c.contactNo, c.emailAddr,
    b.refNo, b.created_at,
    bi.productName, bi.totalAmount, bi.booked_date, bi.status, bi.materialURL,
    l.locName 
    FROM booking_items bi 
    JOIN bookings b ON b.book_id = bi.book_id
    JOIN locations l on l.loc_id = bi.loc_id
    JOIN customers c ON b.cus_id = c.cus_id
    WHERE status != "Cancelled"
    AND b.refNo = ?;`, 
    [req.body.refNo]);

    var result:any = await DB.query(sql);

    res.status(200).send({
      firstName: result[0].firstName,
      middleName: result[0].middleName,
      lastName: result[0].lastName,
      contactNo: result[0].contactNo,
      emailAddr: result[0].emailAddr,
      refNo: result[0].refNo,
      booking_date: result[0].created_at,
      productName: result[0].productName,
      totalAmount: result[0].totalAmount,
      booked_date: moment(result[0].booked_date).format("YYYY-MM-DD"),
      status: result[0].status,
      materialURL: result[0].materialURL,
      locName: result[0].locName
    });
  },

  // Delete booking by reference number and send back updated list
  async deleteBooking(req:Request, res:Response){
    const refNo = req.body.refNo;
    var sqlDel = SqlString.format(`UPDATE booking_items SET status = 'Cancelled' 
    WHERE book_id IN (SELECT book_id FROM bookings WHERE refNo = ?);`, 
    [refNo]);

    var resultDel:any = await DB.query(sqlDel);

    var sql = SqlString.format(`SELECT c.firstName, c.middleName, c.lastName, c.contactNo, c.emailAddr,
    b.refNo, 
    bi.productName, bi.totalAmount, bi.booked_date, bi.status 
    FROM booking_items bi 
    JOIN bookings b ON b.book_id = bi.book_id
    JOIN customers c ON b.cus_id = c.cus_id
    WHERE status != "Cancelled";`, 
    []);

    var result:any = await DB.query(sql);

    res.status(200).send(result);
  },

  // Get booked dates
  async getBookedDates(req:Request, res:Response){
    var sql = SqlString.format(`SELECT bi.booked_date, bi.status
    FROM booking_items bi
    JOIN bookings b ON b.book_id = bi.book_id
    WHERE bi.status != "Cancelled";`, 
    []);

    var result:any = await DB.query(sql);

    var grouped_dates:any = {}
    for(let row in result){
      if(result[row].status.toUpperCase() === "PAID"){
        if(!Object.keys(grouped_dates).includes(moment(result[row].booked_date).format("YYYY-MM-DD"))){
          grouped_dates[moment(result[row].booked_date).format("YYYY-MM-DD")] = 1;
        } else{
          grouped_dates[moment(result[row].booked_date).format("YYYY-MM-DD")] += 1;
        }
      } else{
        // Booking on other statuses not to be included
      }
    }
 
    console.log(grouped_dates);

    var dates:any = [];
    for(let d in grouped_dates){
      if(grouped_dates[d] >= 3){
        dates.push(d);
      } else{
        // If not more than 3, don't include to blocked off dates
      }
    }

    res.status(200).send(dates);
  },

  // Set status as "Paid"
  async setStatusPaid(req:Request, res:Response){
    const refNo = req.body.refNo;
    var sqlPaid = SqlString.format(`UPDATE booking_items SET status = 'Paid' 
    WHERE book_id IN (SELECT book_id FROM bookings WHERE refNo = ?);`, 
    [refNo]);

    var resultPaid:any = await DB.query(sqlPaid);

    var sqlCus = SqlString.format(`SELECT firstName, middleName, lastName, emailAddr FROM customers WHERE cus_id IN (SELECT cus_id FROM bookings WHERE refNo = ?);`,
    [refNo]);

    var resultCus:any = await DB.query(sqlCus);

    var sqlBook = SqlString.format(`SELECT bi.booked_date, l.locName FROM booking_items bi
    JOIN locations l ON bi.loc_id = l.loc_id
    WHERE book_id IN (SELECT book_id FROM bookings WHERE refNo = ?);`,
    [refNo]);

    var resultBook:any = await DB.query(sqlBook);

    // Send email to customer -> Payment received message and booking details
    var email_addr = resultCus[0].emailAddr;
    var full_name = resultCus[0].firstName + ' ' + resultCus[0].middleName + ' ' + resultCus[0].lastName;
    var subject = 'GreetingsPH Booking Request';
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
        height: auto;
        background-color: #f2f2f2;
      "
    >
      <table 
        style="
          background-color: #1670DF;
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
                      <h1 style="
                          color: #ffffff;
                          font-size: 24px;
                          letter-spacing: 1px;
                          padding: 0;
                          margin: 8px 0;
                        "
                      >TITLE</h1>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <h3 style="
                          text-align: left;
                          color: #ffffff;
                        "
                      ></h3>
                    </td>
                  </tr>
                </tbody>
              
              
              </table>
            </td>
    
            <td style="
                margin: auto;
                align-items: right;
                justify-content: right;
                text-align: right;
                padding-right: 16px;
              "
            >
              <img 
               style="
                 width: 26%;
                 height: 67%;
               "
               src="https://google.com/">
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
              <p style="
                  text-align: left;
                  font-size: 15px;
                  padding: 0 16px;
                  text-indent:0
                "
              >Hello ` + resultCus[0].firstName + `,</p>
              <p style="
                   text-align: left;
                   font-size: 15px;
                   padding: 0 16px;
                   text-indent:0
                 "
               > We received your booking payment. Thank you! Your material will be displayed at your selected location [` + resultBook[0].locName + `] on your selected date [`+ resultBook[0].booked_date + `]. You're always welcome to visit <a href="` + config.env.BASE_URL + `booking">Site Home Page</a> and book more materials.</p>
            </td>
          </tr>
  
        </tbody>
      </table>  
    </body>
    `;

    EmailUtils.sendEmailMS(email_addr, full_name, subject, email_body, attachments);

    res.status(200).send({success: true});
  },

  // Set provided status as status of provided reference number
  async setStatus(req:Request, res:Response){
    const refNo = req.body.refNo;
    const status = req.body.status;

    // Check if status is already paid
    var sqlCheck = SqlString.format(`SELECT status 
    FROM booking_items
    WHERE book_id IN (SELECT book_id FROM bookings WHERE refNo = ?)
    AND status != "Paid";`,
    [refNo]);

    var resultCheck:any = await DB.query(sqlCheck);

    if(!resultCheck.length){
      res.status(200).send({success: true});
    } else{

    // Set status
      var sql = SqlString.format(`UPDATE booking_items 
      SET status = ?
      WHERE book_id IN (SELECT book_id FROM bookings WHERE refNo = ?);`,
      [status, refNo]);
  
      var result:any = await DB.query(sql);
  
      // Get Customer Info
      var sqlCus = SqlString.format(`SELECT firstName, middleName, lastName, emailAddr FROM customers WHERE cus_id IN (SELECT cus_id FROM bookings WHERE refNo = ?);`,
      [refNo]);
  
      var resultCus:any = await DB.query(sqlCus);
  
      // Get booking details
      var sqlBook = SqlString.format(`SELECT bi.booked_date, bi.materialURL, bi.loc_id,
      l.locName 
      FROM booking_items bi
      JOIN locations l ON bi.loc_id = l.loc_id
      WHERE book_id IN (SELECT book_id FROM bookings WHERE refNo = ?);`,
      [refNo]);
  
      var resultBook:any = await DB.query(sqlBook);
  
      // Get admins and stakeholders
      var sqlAdmins = SqlString.format(`SELECT firstName, role, emailAddr 
      FROM users 
      WHERE role IN ("admin", "approver", "stakeholder");`,
      []);
  
      var resultAdmins:any = await DB.query(sqlAdmins);
  
      // Send email to customer -> Payment received message and booking details
      var email_addr = resultCus[0].emailAddr; 
      var full_name = resultCus[0].firstName + ' ' + resultCus[0].middleName + ' ' + resultCus[0].lastName;
      var subject = 'Booking Request';
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
          height: auto;
          background-color: #f2f2f2;
        "
      >
        <table 
          style="
            background-color: #1670DF;
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
                        <h1 style="
                            color: #ffffff;
                            font-size: 24px;
                            letter-spacing: 1px;
                            padding: 0;
                            margin: 8px 0;
                          "
                        >TITLE</h1>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h3 style="
                            text-align: left;
                            color: #ffffff;
                          "
                        ></h3>
                      </td>
                    </tr>
                  </tbody>
                
                
                </table>
              </td>
      
              <td style="
                  margin: auto;
                  align-items: right;
                  justify-content: right;
                  text-align: right;
                  padding-right: 16px;
                "
              >
                <img 
                 style="
                   width: 26%;
                   height: 67%;
                 "
                 src="https://google.com/">
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
                <p style="
                    text-align: left;
                    font-size: 15px;
                    padding: 0 16px;
                    text-indent:0
                  "
                >Hello ` + resultCus[0].firstName + `,</p>
                <p style="
                    text-align: left;
                    font-size: 15px;
                    padding: 0 16px;
                    text-indent:0
                  "
                > Thank you for your payment. This is to confirm that we have received your booking payment with reference # refNo. Watch out for your material to be displayed according to the following details:</p>
              </td>
            </tr>
            <tr>
              <table
                style="        
                  width: 100%;
                  padding-left: 1rem;
                  padding-right: 1rem;
                  border-spacing: 0px;
                "
              >
                <tbody>
                  <tr>
                    <th                       
                      style="
                        text-align: left;
                        background-color: #dfdfdf;
                        height: 2.5rem;
                        border: 1px 0 solid #7D8390;
                        font-size: 15px;
                        padding: 0 16px;
                        text-indent:0
                      "
                    >
                      Location
                    </th>
                    <td  
                      style="
                        text-align: left;
                        background-color: #dfdfdf;
                        height: 2.5rem;
                        border: 1px 0 solid #7D8390;
                        font-size: 15px;
                        padding: 0 16px;
                        text-indent:0
                      "
                    >`
                      + resultBook[0].locName +
                    `</td>
                  </tr>
                  <tr>
                    <th                       
                      style="
                        text-align: left;
                        background-color: #dfdfdf;
                        height: 2.5rem;
                        border: 1px 0 solid #7D8390;
                        font-size: 15px;
                        padding: 0 16px;
                        text-indent:0
                      "
                    >
                      Date
                    </th>
                    <td  
                      style="
                        text-align: left;
                        background-color: #dfdfdf;
                        height: 2.5rem;
                        border: 1px 0 solid #7D8390;
                        font-size: 15px;
                        padding: 0 16px;
                        text-indent:0
                      "
                    >`
                      + moment(resultBook[0].booked_date).format("YYYY-MM-DD") +
                    `</td>
                  </tr>
                </tbody>
              </table>
            </tr>
            <tr>
              <td>
                <p style="
                    text-align: left;
                    font-size: 15px;
                    padding: 0 16px;
                    text-indent:0
                  "
                ><a href="` + config.env.BASE_URL + `terms-and-conditions` + `">Terms and Conditions</a></p>
              </td>
            </tr>
            <tr>
              <td>
                <p style="
                    text-align: left;
                    font-size: 15px;
                    padding: 0 16px;
                    text-indent:0
                  "
                >Come back to <a href="` + config.env.BASE_URL + `">Site Home Page</a> to book your next material to surprise someone you love!</p>
              </td>
            </tr>
    
          </tbody>
        </table>  
      </body>
      `;
  
      EmailUtils.sendEmailMS(email_addr, full_name, subject, email_body, attachments);
  
      // Send email to admins and stakeholders
      var admin_details:any = [];
  
      var vid_attach:any = [];
      
      for(let a in resultAdmins){
  
      var ad_email_addr = resultAdmins[a].emailAddr; // "nesthy@retailgate.tech";
      var ad_full_name = resultAdmins[a].firstName + ' ' + resultAdmins[a].middleName + ' ' + resultAdmins[a].lastName;
      var ad_subject = 'GreetingsPH [Payment Received]';
      var ad_attachments = null;
      var ad_email_body = `
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
          height: auto;
          background-color: #f2f2f2;
        "
      >
        <table 
          style="
            background-color: #1670DF;
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
                        <h1 style="
                            color: #ffffff;
                            font-size: 24px;
                            letter-spacing: 1px;
                            padding: 0;
                            margin: 8px 0;
                          "
                        >TITLE</h1>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h3 style="
                            text-align: left;
                            color: #ffffff;
                          "
                        ></h3>
                      </td>
                    </tr>
                  </tbody>
                
                
                </table>
              </td>
      
              <td style="
                  margin: auto;
                  align-items: right;
                  justify-content: right;
                  text-align: right;
                  padding-right: 16px;
                "
              >
                <img 
                 style="
                   width: 26%;
                   height: 67%;
                 "
                 src="https://google.com/">
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
                <p style="
                    text-align: left;
                    font-size: 15px;
                    padding: 0 16px;
                    text-indent:0
                  "
                >Hello ` + resultAdmins[a].firstName + `,</p>
                <p style="
                    text-align: left;
                    font-size: 15px;
                    padding: 0 16px;
                    text-indent:0
                  "
                > Payment has been received from ` + resultCus[0].firstName + ` (`+ resultCus[0].emailAddr + `). Please see the details of the booking below:
              </td>
            </tr>
            <tr>
              <table
                style="        
                  width: 100%;
                  padding-left: 1rem;
                  padding-right: 1rem;
                  border-spacing: 0px;
                "
              >
                <tbody>
                  <tr>
                    <th                       
                      style="
                        text-align: left;
                        background-color: #dfdfdf;
                        height: 2.5rem;
                        border: 1px 0 solid #7D8390;
                        font-size: 15px;
                        padding: 0 16px;
                        text-indent:0
                      "
                    >
                      Location
                    </th>
                    <td  
                      style="
                        text-align: left;
                        background-color: #dfdfdf;
                        height: 2.5rem;
                        border: 1px 0 solid #7D8390;
                        font-size: 15px;
                        padding: 0 16px;
                        text-indent:0
                      "
                    >`
                      + resultBook[0].locName +
                    `</td>
                  </tr>
                  <tr>
                    <th                       
                      style="
                        text-align: left;
                        background-color: #dfdfdf;
                        height: 2.5rem;
                        border: 1px 0 solid #7D8390;
                        font-size: 15px;
                        padding: 0 16px;
                        text-indent:0
                      "
                    >
                      Date
                    </th>
                    <td  
                      style="
                        text-align: left;
                        background-color: #dfdfdf;
                        height: 2.5rem;
                        border: 1px 0 solid #7D8390;
                        font-size: 15px;
                        padding: 0 16px;
                        text-indent:0
                      "
                    >`
                      + moment(resultBook[0].booked_date).format("YYYY-MM-DD") +
                    `</td>
                  </tr>
                </tbody>
              </table>
            </tr>
            <tr>
              <td>
                <p style="
                    text-align: left;
                    font-size: 15px;
                    padding: 0 16px;
                    text-indent:0
                  "
                >You may review the material <a href="` + resultBook[0].materialURL + ` ">here</a>. You may also review the booking details and the material by logging in at <a href="` + config.env.BASE_URL + `pendingbookings">Site Approval Page</a></p>
              </td>
            <tr>
    
          </tbody>
        </table>  
      </body>
      `;

      admin_details.push({
        emailAddr: ad_email_addr,
        fullName: ad_full_name,
        subject: ad_subject,
        attachments: ad_attachments,
        emailBody: ad_email_body
      });
  
      }

      EmailUtils.sendBulk(admin_details, vid_attach);
  
      // After latest payment, check if all slots of the site for the specified date is already taken
      // Get number of paid bookings for the site for the specified date
      var sqlPaid = SqlString.format(`SELECT COUNT(bookitem_id) AS cnt
      FROM booking_items
      WHERE status = "Paid"
      AND loc_id = ?
      AND booked_date = ?;`,
      [resultBook[0].loc_id, moment(resultBook[0].booked_date).format("YYYY-MM-DD")]);
      var resultPaid:any = await DB.query(sqlPaid);
      
      // If no slots left after latest payment, send email to other customers who booked the site on the same date
      if(resultPaid[0].cnt >= 3){
        // Get other customers who booked for the site on the same date
        var sqlCus = SqlString.format(`SELECT c.firstName, c.middleName, c.lastName, c.emailAddr
        FROM customers c
        JOIN bookings b ON b.cus_id = c.cus_id
        JOIN booking_items bi ON bi.book_id = b.book_id
        WHERE loc_id = ?
        AND bi.booked_date = ?
        AND bi.status = "Pending Booking"; `,
        [resultBook[0].loc_id, moment(resultBook[0].booked_date).format("YYYY-MM-DD")]);
        var resultCus:any = await DB.query(sqlCus);
        // Send email to unfortunate customers
        var vid_attach:any = [];
        var customer_details:any = [];
        for(let c in resultCus){
          var cus_email_addr = resultCus[c].emailAddr; // "nesthy@retailgate.tech";
          var cus_full_name = resultCus[c].firstName + ' ' + resultCus[c].middleName + ' ' + resultCus[c].lastName;
          var cus_subject = 'GreetingsPH Site Fully Booked';
          var cus_attachments = null;
          var cus_email_body = `
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
            height: auto;
            background-color: #f2f2f2;
          "
          >
            <table 
              style="
                background-color: #1670DF;
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
                            <h1 style="
                                color: #ffffff;
                                font-size: 24px;
                                letter-spacing: 1px;
                                padding: 0;
                                margin: 8px 0;
                              "
                            >TITLE</h1>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <h3 style="
                                text-align: left;
                                color: #ffffff;
                              "
                            ></h3>
                          </td>
                        </tr>
                      </tbody>
                    
                    
                    </table>
                  </td>
          
                  <td style="
                      margin: auto;
                      align-items: right;
                      justify-content: right;
                      text-align: right;
                      padding-right: 16px;
                    "
                  >
                    <img 
                     style="
                       width: 26%;
                       height: 67%;
                     "
                     src="https://google.com/">
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
                    <p style="
                        text-align: left;
                        font-size: 15px;
                        padding: 0 16px;
                        text-indent:0
                      "
                    >Hello ` + resultCus[c].firstName + `,</p>
                    <p style="
                        text-align: left;
                        font-size: 15px;
                        padding: 0 16px;
                        text-indent:0
                      "
                    > We regret to inform you that as we operate on a first paid first served basis, the site you have requested is no longer available. You may book again thru <a href="` + config.env.BASE_URL + `">Site Home Page</a> and we strongly recommend that you pay immediately upon approval in order to secure your spot immediately.</p>
                    <p style="
                        text-align: left;
                        font-size: 15px;
                        padding: 0 16px;
                        text-indent:0
                      "
                    >Thank you!</p>
                  </td>
                </tr>
        
              </tbody>
            </table>  
          </body>
          `;
      
          customer_details.push({
            emailAddr: cus_email_addr,
            fullName: cus_full_name,
            subject: cus_subject,
            attachments: cus_attachments,
            emailBody: cus_email_body
          });
      
        }
      
        //console.log(customer_details);
        EmailUtils.sendBulk(customer_details, vid_attach);
        
        console.log(resultBook[0].loc_id);
        console.log(moment(resultBook[0].booked_date).format("YYYY-MM-DD"));
        //TODO Update status of bookings on fully booked day for the specified site
        var sqlExpire = SqlString.format(`UPDATE booking_items 
        SET status = "Expired"
        WHERE loc_id = ?
        AND booked_date = ?
        AND status = "Pending Booking";`,
        [resultBook[0].loc_id, moment(resultBook[0].booked_date).format("YYYY-MM-DD")]);
  
        var resultExpire:any = await DB.query(sqlExpire);
  
      }
  
      res.status(200).send({success: true});
    }
  },

  // Set provided status as status of provided reference number and send corresponding email
  async setEvalResult(req:Request, res:Response){
    const refNo = req.body.refNo;
    const status = req.body.status;
    var reason = '';

    if(req.body.reason){
      reason += req.body.reason;
    }

    var sql = '';

    if(status === "Approved"){
      sql = SqlString.format(`UPDATE booking_items 
      SET status = ?, approval_date = ?, reason = ?
      WHERE book_id IN (SELECT book_id FROM bookings WHERE refNo = ?);`,
      [status, moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),reason, refNo]);
    } else{
      sql = SqlString.format(`UPDATE booking_items 
      SET status = ?, reason = ?
      WHERE book_id IN (SELECT book_id FROM bookings WHERE refNo = ?);`,
      [status, reason, refNo]);
    }

    var result:any = await DB.query(sql);

    var sqlSel = SqlString.format(`SELECT c.firstName, c.middleName, c.lastName, c.emailAddr,
    b.checkoutID, b.checkoutURL, 
    bi.productName, bi.loc_id, bi.spots, bi.totalAmount, bi.booked_date,
    l.locName 
    FROM booking_items bi 
    JOIN bookings b ON b.book_id = bi.book_id
    JOIN locations l ON l.loc_id = bi.loc_id
    JOIN customers c ON b.cus_id = c.cus_id
    WHERE b.refNo = ?;`, 
    [refNo]);

    var resultSel:any = await DB.query(sqlSel);

    var sqlApprovers = SqlString.format(`SELECT firstName, middleName, lastName, emailAddr
    FROM users
    WHERE role = "approver";`, 
    []);

    var resultApprovers:any = await DB.query(sqlApprovers);

    var email_addr = '';
    var full_name = '';
    var subject = '';
    var attachments = null;
    var email_body = '';

    if(status === "Reviewed"){
      email_addr = resultApprovers[0].emailAddr; 
      full_name = resultApprovers[0].firstName + ' ' + resultApprovers[0].middleName + ' ' + resultApprovers[0].lastName;
      subject = 'GreetingsPH Booking Request';
      attachments = null;
      email_body += `
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
          height: auto;
          background-color: #f2f2f2;
        "
      >
        <table 
          style="
            background-color: #1670DF;
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
                        <h1 style="
                            color: #ffffff;
                            font-size: 24px;
                            letter-spacing: 1px;
                            padding: 0;
                            margin: 8px 0;
                          "
                        >TITLE</h1>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h3 style="
                            text-align: left;
                            color: #ffffff;
                          "
                        ></h3>
                      </td>
                    </tr>
                  </tbody>
                
                
                </table>
              </td>
      
              <td style="
                  margin: auto;
                  align-items: right;
                  justify-content: right;
                  text-align: right;
                  padding-right: 16px;
                "
              >
                <img 
                 style="
                   width: 26%;
                   height: 67%;
                 "
                 src="https://google.com/">
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
                <p style="
                    text-align: left;
                    font-size: 15px;
                    padding: 0 16px;
                    text-indent:0
                  "
                >Hello ` + resultApprovers[0].firstName + `,</p>
                <p style="
                    text-align: left;
                    font-size: 15px;
                    padding: 0 16px;
                    text-indent:0
                  "
                > A new booking request has passed initial review and is now subject to your approval. Please check this link: <a href="` + config.env.BASE_URL + `pendingbookings">Dashboard</a> to review the material for your final approval.</p>
              </td>
            </tr>
    
          </tbody>
        </table>  
      </body>
      `;

      EmailUtils.sendEmailMS(email_addr, full_name, subject, email_body, attachments);
    }

    if(status === "Approved"){
      //Send approval email
      var units = 128;
      var qty = 1;
      email_addr = resultSel[0].emailAddr // 'nesthy@retailgate.tech';
      full_name = resultSel[0].firstName + ' ' + resultSel[0].middleName + ' ' + resultSel[0].lastName;
      subject = 'Payment';
      attachments = null;
      email_body += `
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
            height: auto;
            background-color: #f2f2f2;
          "
        >
          <table 
            style="
              background-color: #1670DF;
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
                          <h1 style="
                              color: #ffffff;
                              font-size: 24px;
                              letter-spacing: 1px;
                              padding: 0;
                              margin: 8px 0;
                            "
                          >TITLE</h1>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <h3 style="
                              text-align: left;
                              color: #ffffff;
                            "
                          ></h3>
                        </td>
                      </tr>
                    </tbody>
                  
                  
                  </table>
                </td>
        
                <td style="
                    margin: auto;
                    align-items: right;
                    justify-content: right;
                    text-align: right;
                    padding-right: 16px;
                  "
                >
                  <img 
                   style="
                     width: 26%;
                     height: 67%;
                   "
                   src="https://google.com/">
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
                  <h2 style="
                      text-align: center;
                      margin: 8px 0;
                    "
                  >INVOICE</h2>
                </td>
              </tr>
              <tr>


                <table
                  style="        
                    width: 100%;
                    padding-left: 1rem;
                    padding-right: 1rem;
                    border-spacing: 0px;
                  "
                >
                  <tbody>
                    <tr>
                      <th                       
                        style="
                          text-align: left;
                          background-color: #dfdfdf;
                          height: 2.5rem;
                          border: 1px 0 solid #7D8390;
                          font-size: 15px;
                          padding: 0 16px;
                          text-indent:0
                        "
                      >
                      Service
                      </th>
                      <td  
                        style="
                          text-align: left;
                          background-color: #dfdfdf;
                          height: 2.5rem;
                          border: 1px 0 solid #7D8390;
                          font-size: 15px;
                          padding: 0 16px;
                          text-indent:0
                        "
                      >`
                        + resultSel[0].productName +
                      `</td>
                    </tr>
    
                    <tr>
                      <th                       
                        style="
                          text-align: left;
                          background-color: #fffff;
                          height: 2.5rem;
                          border: 1px 0 solid #7D8390;
                          font-size: 15px;
                          padding: 0 16px;
                          text-indent:0
                        "
                      >
                      Booking Location
                      </th>
                      <td  
                        style="
                          text-align: left;
                          background-color: #fffff;
                          height: 2.5rem;
                          border: 1px 0 solid #7D8390;
                          font-size: 15px;
                          padding: 0 16px;
                          text-indent:0
                        "
                      >`
                        + resultSel[0].locName +
                      `</td>
                    </tr>
    
    
                    <tr>
                      <th                       
                        style="
                          text-align: left;
                          background-color: #dfdfdf;
                          height: 2.5rem;
                          border: 1px 0 solid #7D8390;
                          font-size: 15px;
                          padding: 0 16px;
                          text-indent:0
                        "
                      >
                      Booking Date
                      </th>
                      <td  
                        style="
                          text-align: left;
                          background-color: #dfdfdf;
                          height: 2.5rem;
                          border: 1px 0 solid #7D8390;
                          font-size: 15px;
                          padding: 0 16px;
                          text-indent:0
                        "
                      >`
                        + moment(resultSel[0].booked_date).format("YYYY-MM-DD") +
                      `</td>
                    </tr>
    
                    <tr>
                      <th                       
                        style="
                          text-align: left;
                          background-color: #fffff;
                          height: 2.5rem;
                          border: 1px 0 solid #7D8390;
                          font-size: 15px;
                          padding: 0 16px;
                          text-indent:0
                        "
                      >
                      Unit (spots)
                      </th>
                      <td  
                        style="
                          text-align: left;
                          background-color: #fffff;
                          height: 2.5rem;
                          border: 1px 0 solid #7D8390;
                          font-size: 15px;
                          padding: 0 16px;
                          text-indent:0
                        "
                      >`
                        + resultSel[0].spots + // units +
                      `</td>
                    </tr>
    
                    <tr>
                      <th                       
                        style="
                          text-align: left;
                          background-color: #dfdfdf;
                          height: 2.5rem;
                          border: 1px 0 solid #7D8390;
                          font-size: 15px;
                          padding: 0 16px;
                          text-indent:0
                        "
                      >
                      Unit Cost
                      </th>
                      <td  
                        style="
                          text-align: left;
                          background-color: #dfdfdf;
                          height: 2.5rem;
                          border: 1px 0 solid #7D8390;
                          font-size: 15px;
                          padding: 0 16px;
                          text-indent:0
                        "
                      >`
                        + resultSel[0].totalAmount +
                      `</td>
                    </tr>
    
                    <tr>
                      <th                       
                        style="
                          text-align: left;
                          background-color: #fffff;
                          height: 2.5rem;
                          border: 1px 0 solid #7D8390;
                          font-size: 15px;
                          padding: 0 16px;
                          text-indent:0
                        "
                      >
                      Qty
                      </th>
                      <td  
                        style="
                          text-align: left;
                          background-color: #fffff;
                          height: 2.5rem;
                          border: 1px 0 solid #7D8390;
                          font-size: 15px;
                          padding: 0 16px;
                          text-indent:0
                        "
                      >`
                        + qty +
                      `</td>
                    </tr>
    
                    <tr>
                      <th                       
                        style="
                          text-align: left;
                          background-color: #dfdfdf;
                          height: 2.5rem;
                          border: 1px 0 solid #7D8390;
                          font-size: 15px;
                          padding: 0 16px;
                          text-indent:0
                        "
                      >
                      Total Cost
                      </th>
                      <td  
                        style="
                          text-align: left;
                          background-color: #dfdfdf;
                          height: 2.5rem;
                          border: 1px 0 solid #7D8390;
                          font-size: 15px;
                          padding: 0 16px;
                          text-indent:0
                        "
                      >`
                        + resultSel[0].totalAmount + //* units +
                      `</td>
                    </tr>
    
                  </tbody>
                </table>


              </tr>
              <tr>
                <div 
                  style="
                    margin:1rem;
                    text-align: center;
                  "
                >
                  <a href="` + config.env.BASE_URL + `payment-redirect?refno=` + refNo + `">
                    <img 
                      style="
                        width: 50%;
                        height: 25%;
                      "
                      src="https://www.clker.com/cliparts/3/X/i/6/j/i/light-blue-pay-now-button.svg.hi.png"
                    > </img>
                  </a>
                </div>
              </tr>
            </tbody>
          </table>  
        </body>
      `;

      
      EmailUtils.sendEmailMS(email_addr, full_name, subject, email_body, attachments);

    } else if(status === "Rejected"){
      //Send rejection email
      email_addr = resultSel[0].emailAddr;
      full_name = resultSel[0].firstName + ' ' + resultSel[0].middleName + ' ' + resultSel[0].lastName;
      subject = 'GreetingsPH Material Rejection';
      attachments = null;
      email_body += `
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
          height: auto;
          background-color: #f2f2f2;
        "
      >
        <table 
          style="
            background-color: #1670DF;
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
                        <h1 style="
                            color: #ffffff;
                            font-size: 24px;
                            letter-spacing: 1px;
                            padding: 0;
                            margin: 8px 0;
                          "
                        >TITLE</h1>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h3 style="
                            text-align: left;
                            color: #ffffff;
                          "
                        ></h3>
                      </td>
                    </tr>
                  </tbody>
                
                
                </table>
              </td>
      
              <td style="
                  margin: auto;
                  align-items: right;
                  justify-content: right;
                  text-align: right;
                  padding-right: 16px;
                "
              >
                <img 
                 style="
                   width: 26%;
                   height: 67%;
                 "
                 src="https://google.com/">
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
                <p style="
                    text-align: left;
                    font-size: 15px;
                    padding: 0 16px;
                    text-indent:0
                  "
                >Dear ` + resultSel[0].firstName + `,</p>
                <p style="
                    text-align: left;
                    font-size: 15px;
                    padding: 0 16px;
                    text-indent:0
                  "
                >We regret to inform you that your material has been rejected for the following reason(s):</p> 
                <ul>
                  <li style="
                      text-align: left;
                      font-size: 15px;
                      padding: 0 16px;
                      text-indent:0
                    "
                  >` + reason + `</li>
                </ul>
                <p style="
                    text-align: left;
                    font-size: 15px;
                    padding: 0 16px;
                    text-indent:0
                  "
                > Please see the guidelines through this link <a href="` + config.env.BASE_URL + `guide">Materials Guideline</a> and you may book another date with your updated material through <a href="` + config.env.BASE_URL + `">Site Home Page</a>.</p>
              </td>
            </tr>
    
          </tbody>
        </table>  
      </body>
      `;

      EmailUtils.sendEmailMS(email_addr, full_name, subject, email_body, attachments);
    }

    res.status(200).send({success: true});
  },

  async mayaPaymentSuccess(req:Request, res:Response){
    var refNo = req.body.requestReferenceNumber

    // Set status
    var sql = SqlString.format(`UPDATE booking_items 
    SET status = "Paid"
    WHERE book_id IN (SELECT book_id FROM bookings WHERE refNo = ?);`,
    [refNo]);
    
    var result:any = await DB.query(sql);
    
    // Get Customer Info
    var sqlCus = SqlString.format(`SELECT firstName, middleName, lastName, emailAddr FROM customers WHERE cus_id IN (SELECT cus_id FROM bookings WHERE refNo = ?);`,
    [refNo]);
    
    var resultCus:any = await DB.query(sqlCus);
    
    if(resultCus.length){

    // Get booking details
    var sqlBook = SqlString.format(`SELECT bi.booked_date, bi.materialURL, bi.loc_id,
    l.locName 
    FROM booking_items bi
    JOIN locations l ON bi.loc_id = l.loc_id
    WHERE book_id IN (SELECT book_id FROM bookings WHERE refNo = ?);`,
    [refNo]);
    
    var resultBook:any = await DB.query(sqlBook);
    
    // Get admins and stakeholders
    var sqlAdmins = SqlString.format(`SELECT firstName, role, emailAddr 
    FROM users 
    WHERE role IN ("admin", "approver", "stakeholder");`,
    []);
    
    var resultAdmins:any = await DB.query(sqlAdmins);
    
    // Send email to customer -> Payment received message and booking details
    var email_addr = resultCus[0].emailAddr; 
    var full_name = resultCus[0].firstName + ' ' + resultCus[0].middleName + ' ' + resultCus[0].lastName;
    var subject = 'Booking Request';
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
        height: auto;
        background-color: #f2f2f2;
      "
    >
      <table 
        style="
          background-color: #1670DF;
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
                      <h1 style="
                          color: #ffffff;
                          font-size: 24px;
                          letter-spacing: 1px;
                          padding: 0;
                          margin: 8px 0;
                        "
                      >TITLE</h1>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <h3 style="
                          text-align: left;
                          color: #ffffff;
                        "
                      ></h3>
                    </td>
                  </tr>
                </tbody>
              
              
              </table>
            </td>
    
            <td style="
                margin: auto;
                align-items: right;
                justify-content: right;
                text-align: right;
                padding-right: 16px;
              "
            >
              <img 
               style="
                 width: 26%;
                 height: 67%;
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
              <p style="
                  text-align: left;
                  font-size: 15px;
                  padding: 0 16px;
                  text-indent:0
                "
              >Hello ` + resultCus[0].firstName + `,</p>
              <p style="
                  text-align: left;
                  font-size: 15px;
                  padding: 0 16px;
                  text-indent:0
                "
              > Thank you for your payment. This is to confirm that we have received your booking payment with reference # refNo. Watch out for your material to be displayed according to the following details:</p>
            </td>
          </tr>
          <tr>
            <table
              style="        
                width: 100%;
                padding-left: 1rem;
                padding-right: 1rem;
                border-spacing: 0px;
              "
            >
              <tbody>
                <tr>
                  <th                       
                    style="
                      text-align: left;
                      background-color: #dfdfdf;
                      height: 2.5rem;
                      border: 1px 0 solid #7D8390;
                      font-size: 15px;
                      padding: 0 16px;
                      text-indent:0
                    "
                  >
                    Location
                  </th>
                  <td  
                    style="
                      text-align: left;
                      background-color: #dfdfdf;
                      height: 2.5rem;
                      border: 1px 0 solid #7D8390;
                      font-size: 15px;
                      padding: 0 16px;
                      text-indent:0
                    "
                  >`
                    + resultBook[0].locName +
                  `</td>
                </tr>
                <tr>
                  <th                       
                    style="
                      text-align: left;
                      background-color: #dfdfdf;
                      height: 2.5rem;
                      border: 1px 0 solid #7D8390;
                      font-size: 15px;
                      padding: 0 16px;
                      text-indent:0
                    "
                  >
                    Date
                  </th>
                  <td  
                    style="
                      text-align: left;
                      background-color: #dfdfdf;
                      height: 2.5rem;
                      border: 1px 0 solid #7D8390;
                      font-size: 15px;
                      padding: 0 16px;
                      text-indent:0
                    "
                  >`
                    + moment(resultBook[0].booked_date).format("YYYY-MM-DD") +
                  `</td>
                </tr>
              </tbody>
            </table>
          </tr>
          <tr>
            <td>
              <p style="
                  text-align: left;
                  font-size: 15px;
                  padding: 0 16px;
                  text-indent:0
                "
              ><a href="` + config.env.BASE_URL + `terms-and-conditions` + `">Terms and Conditions</a></p>
            </td>
          </tr>
          <tr>
            <td>
              <p style="
                  text-align: left;
                  font-size: 15px;
                  padding: 0 16px;
                  text-indent:0
                "
              >Come back to <a href="` + config.env.BASE_URL + `">Site Home Page</a> to book your next material to surprise someone you love!</p>
            </td>
          </tr>
  
        </tbody>
      </table>  
    </body>
    `;
    
    
    EmailUtils.sendEmailMS(email_addr, full_name, subject, email_body, attachments);
    
    // Send email to admins and stakeholders
    var admin_details:any = [];

    var vid_attach:any = [];
        
    for(let a in resultAdmins){
    
    var ad_email_addr = resultAdmins[a].emailAddr; // "nesthy@retailgate.tech";
    var ad_full_name = resultAdmins[a].firstName + ' ' + resultAdmins[a].middleName + ' ' + resultAdmins[a].lastName;
    var ad_subject = '[Payment Received]';
    var ad_attachments = null;
    var ad_email_body = `
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
        height: auto;
        background-color: #f2f2f2;
      "
    >
      <table 
        style="
          background-color: #1670DF;
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
                      <h1 style="
                          color: #ffffff;
                          font-size: 24px;
                          letter-spacing: 1px;
                          padding: 0;
                          margin: 8px 0;
                        "
                      >TITLE</h1>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <h3 style="
                          text-align: left;
                          color: #ffffff;
                        "
                      ></h3>
                    </td>
                  </tr>
                </tbody>
              
              
              </table>
            </td>
    
            <td style="
                margin: auto;
                align-items: right;
                justify-content: right;
                text-align: right;
                padding-right: 16px;
              "
            >
              <img 
               style="
                 width: 26%;
                 height: 67%;
               "
               src="https://google.com/">
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
              <p style="
                  text-align: left;
                  font-size: 15px;
                  padding: 0 16px;
                  text-indent:0
                "
              >Hello ` + resultAdmins[a].firstName + `,</p>
              <p style="
                  text-align: left;
                  font-size: 15px;
                  padding: 0 16px;
                  text-indent:0
                "
              > Payment has been received from ` + resultCus[0].firstName + ` (`+ resultCus[0].emailAddr + `). Please see the details of the booking below:
            </td>
          </tr>
          <tr>
            <table
              style="        
                width: 100%;
                padding-left: 1rem;
                padding-right: 1rem;
                border-spacing: 0px;
              "
            >
              <tbody>
                <tr>
                  <th                       
                    style="
                      text-align: left;
                      background-color: #dfdfdf;
                      height: 2.5rem;
                      border: 1px 0 solid #7D8390;
                      font-size: 15px;
                      padding: 0 16px;
                      text-indent:0
                    "
                  >
                    Location
                  </th>
                  <td  
                    style="
                      text-align: left;
                      background-color: #dfdfdf;
                      height: 2.5rem;
                      border: 1px 0 solid #7D8390;
                      font-size: 15px;
                      padding: 0 16px;
                      text-indent:0
                    "
                  >`
                    + resultBook[0].locName +
                  `</td>
                </tr>
                <tr>
                  <th                       
                    style="
                      text-align: left;
                      background-color: #dfdfdf;
                      height: 2.5rem;
                      border: 1px 0 solid #7D8390;
                      font-size: 15px;
                      padding: 0 16px;
                      text-indent:0
                    "
                  >
                    Date
                  </th>
                  <td  
                    style="
                      text-align: left;
                      background-color: #dfdfdf;
                      height: 2.5rem;
                      border: 1px 0 solid #7D8390;
                      font-size: 15px;
                      padding: 0 16px;
                      text-indent:0
                    "
                  >`
                    + moment(resultBook[0].booked_date).format("YYYY-MM-DD") +
                  `</td>
                </tr>
              </tbody>
            </table>
          </tr>
          <tr>
            <td>
              <p style="
                  text-align: left;
                  font-size: 15px;
                  padding: 0 16px;
                  text-indent:0
                "
              >You may review the material <a href="` + resultBook[0].materialURL + ` ">here</a>. You may also review the booking details and the material by logging in at <a href="` + config.env.BASE_URL + `pendingbookings">Site Home Page</a></p>
            </td>
          <tr>
  
        </tbody>
      </table>  
    </body>
    `;
    
    admin_details.push({
      emailAddr: ad_email_addr,
      fullName: ad_full_name,
      subject: ad_subject,
      attachments: ad_attachments,
      emailBody: ad_email_body
    });
    
    }
    
    EmailUtils.sendBulk(admin_details, vid_attach);
    //EmailUtils.sendEmailMS_withCC(admin_details, cc_details, ad_subject, ad_email_body, ad_attachments);
    
    // After latest payment, check if all slots of the site for the specified date is already taken
    // Get number of paid bookings for the site for the specified date
    var sqlPaid = SqlString.format(`SELECT COUNT(bookitem_id) AS cnt
    FROM booking_items
    WHERE status = "Paid"
    AND loc_id = ?
    AND booked_date = ?;`,
    [resultBook[0].loc_id, moment(resultBook[0].booked_date).format("YYYY-MM-DD")]);
    var resultPaid:any = await DB.query(sqlPaid);
        
    // If no slots left after latest payment, send email to other customers who booked the site on the same date
    if(resultPaid[0].cnt >= 3){
      // Get other customers who booked for the site on the same date
      var sqlCus = SqlString.format(`SELECT c.firstName, c.middleName, c.lastName, c.emailAddr
      FROM customers c
      JOIN bookings b ON b.cus_id = c.cus_id
      JOIN booking_items bi ON bi.book_id = b.book_id
      WHERE loc_id = ?
      AND bi.booked_date = ?
      AND bi.status = "Pending Booking"; `,
      [resultBook[0].loc_id, moment(resultBook[0].booked_date).format("YYYY-MM-DD")]);
      var resultCus:any = await DB.query(sqlCus);
      // Send email to unfortunate customers
      var vid_attach:any = [];
      var customer_details:any = [];
      for(let c in resultCus){
        var cus_email_addr = resultCus[c].emailAddr; // "nesthy@retailgate.tech";
        var cus_full_name = resultCus[c].firstName + ' ' + resultCus[c].middleName + ' ' + resultCus[c].lastName;
        var cus_subject = 'GreetingsPH Site Fully Booked';
        var cus_attachments = null;
        var cus_email_body = `
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
          height: auto;
          background-color: #f2f2f2;
        "
        >
          <table 
            style="
              background-color: #1670DF;
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
                          <h1 style="
                              color: #ffffff;
                              font-size: 24px;
                              letter-spacing: 1px;
                              padding: 0;
                              margin: 8px 0;
                            "
                          >TITLE</h1>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <h3 style="
                              text-align: left;
                              color: #ffffff;
                            "
                          ></h3>
                        </td>
                      </tr>
                    </tbody>
                  
                  
                  </table>
                </td>
        
                <td style="
                    margin: auto;
                    align-items: right;
                    justify-content: right;
                    text-align: right;
                    padding-right: 16px;
                  "
                >
                  <img 
                   style="
                     width: 26%;
                     height: 67%;
                   "
                   src="https://google.com/">
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
                  <p style="
                      text-align: left;
                      font-size: 15px;
                      padding: 0 16px;
                      text-indent:0
                    "
                  >Hello ` + resultCus[c].firstName + `,</p>
                  <p style="
                      text-align: left;
                      font-size: 15px;
                      padding: 0 16px;
                      text-indent:0
                    "
                  > We regret to inform you that as we operate on a first paid first served basis, the site you have requested is no longer available. You may book again thru <a href="` + config.env.BASE_URL + `">Site Home Page</a> to find available dates and sites.</p>
                  <p style="
                      text-align: left;
                      font-size: 15px;
                      padding: 0 16px;
                      text-indent:0
                    "
                  >Thank you!</p>
                </td>
              </tr>
      
            </tbody>
          </table>  
        </body>
        `;
    
        customer_details.push({
          emailAddr: cus_email_addr,
          fullName: cus_full_name,
          subject: cus_subject,
          attachments: cus_attachments,
          emailBody: cus_email_body
        });
    
      }
    
      EmailUtils.sendBulk(customer_details, vid_attach);
      
      console.log(resultBook[0].loc_id);
      console.log(moment(resultBook[0].booked_date).format("YYYY-MM-DD"));
      //Update status of bookings on fully booked day for the specified site
      var sqlExpire = SqlString.format(`UPDATE booking_items 
      SET status = "Expired"
      WHERE loc_id = ?
      AND booked_date = ?
      AND status = "Pending Booking";`,
      [resultBook[0].loc_id, moment(resultBook[0].booked_date).format("YYYY-MM-DD")]);

      var resultExpire:any = await DB.query(sqlExpire);

    }

    }

    res.status(200).send({success: true});


  },

  async mayaPaymentFailed(req:Request, res:Response){
    console.log(req.body);
    var refNo = req.body.requestReferenceNumber
    // Set status
    var sql = SqlString.format(`UPDATE booking_items 
    SET status = "Payment Error"
    WHERE book_id IN (SELECT book_id FROM bookings WHERE refNo = ?);`,
    [refNo]);
    
    var result:any = await DB.query(sql);

    res.status(200).send({success: true}); 
  },

  async mayaPaymentExpired(req:Request, res:Response){
    console.log(req.body);
    var refNo = req.body.requestReferenceNumber
    // Set status
    var sql = SqlString.format(`UPDATE booking_items 
    SET status = "Payment Expired"
    WHERE book_id IN (SELECT book_id FROM bookings WHERE refNo = ?);`,
    [refNo]);
    
    var result:any = await DB.query(sql);

    res.status(200).send({success: true});
  }
};
