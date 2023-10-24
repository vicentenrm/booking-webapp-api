import * as config from './src/config/config';
import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import cluster from 'cluster';
import { PaymentRoute } from './src/routes/payment.route';
import { UserRoute } from './src/routes/user.route';
import { LocationRoute } from './src/routes/location.route';
import * as fs from 'fs';
import * as https from 'https';

const numCPUs = require('os').cpus().length;
const app = express();

const privateKey = fs.readFileSync('/etc/letsencrypt/live/apistaging.greetingsph.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/apistaging.greetingsph.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/apistaging.greetingsph.com/chain.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

if(cluster.isMaster){
  //console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++){
    cluster.fork();
  }

  cluster.on('online', function(worker){
    //console.log('Worker ' + worker.process.pid + ' is online');
  });
  cluster.on('exit', (worker, code, signal) =>{
    //console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
}else{
  app.use(cors({origin: '*'}));
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  app.use(express.text());
  app.use(express.json());
  app.use('/payment', PaymentRoute);
  app.use('/user', UserRoute);
  app.use('/location', LocationRoute);


  app.get('/', (req, res) => {
    res.send('Greetings APIs.');
  })

  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(config.env.PORT, () => {
    console.log(`App listening at http://localhost:${config.env.PORT}`)
  })

  //app.listen(config.env.PORT, () => {
  //  console.log(`Example app listening at http://localhost:${config.env.PORT}`);
  //})

}








//var sdk = require("paymaya-node-sdk");
//var PaymayaSDK = sdk.PaymayaSDK;
//
//var callback = function(err:any, response:any) {
//   if(err) {
//      console.log(err);
//      return;
//   }
//   console.log(JSON.stringify(response));
//}
//
//PaymayaSDK.initCheckout(
//  'pk-NCLk7JeDbX1m22ZRMDYO9bEPowNWT5J4aNIKIbcTy2a', // 'pk-TnpIh5X432Qw1DJLlMhzxRhBN4fvUp3SHPuHT3m5wv6',
//  'sk-8MqXdZYWV9UJB92Mc0i149CtzTWT7BYBQeiarM27iAi', // 'sk-SNCvnXbvtAxU6mszPMoDl2M1d4e1ivko1E6PLGiOiqm',
//  PaymayaSDK.ENVIRONMENT.SANDBOX
//);
//
////var Checkout = sdk.Checkout;
////var checkout = new Checkout();
//
//var ref_num = 'pm12345';
//
//var Checkout = sdk.Checkout;
//var Contact = sdk.Contact;
//var Address = sdk.Address;
//var Buyer = sdk.Buyer;
//var ItemAmountDetails = sdk.ItemAmountDetails;
//var ItemAmount = sdk.ItemAmount;
//var Item = sdk.Item;
//
//var addressOptions = {
//  	line1 : "9F Robinsons Cybergate 3",
//  	line2 : "Pioneer Street",
//  	city : "Mandaluyong City",
//  	state : "Metro Manila",
//  	zipCode : "12345",
//  	countryCode : "PH"
//};
//
//var contactOptions = {
// 	phone : "+63(2)1234567890",
// 	email : "paymayabuyer1@gmail.com"
//};
//
//var buyerOptions:any = {
//	firstName : "John",
//	middleName : "Michaels",
//	lastName : "Doe"
//};
//	
//var contact = new Contact();
//contact.phone = contactOptions.phone;
//contact.email = contactOptions.email;
//buyerOptions.contact = contact;
//
//var address = new Address();
//address.line1 = addressOptions.line1;
//address.line2 = addressOptions.line2;
//address.city = addressOptions.city;
//address.state = addressOptions.state;
//address.zipCode = addressOptions.zipCode;
//address.countryCode = addressOptions.countryCode;
//buyerOptions.shippingAddress = address;
//buyerOptions.billingAddress = address;
//	  	
///**
//* Construct buyer here
//*/
//var buyer = new Buyer();
//buyer.firstName = buyerOptions.firstName;
//buyer.middleName = buyerOptions.middleName;
//buyer.lastName = buyerOptions.lastName;
//buyer.contact = buyerOptions.contact;
////buyer.shippingAddress = buyerOptions.shippingAddress;
////buyer.billingAddress = buyerOptions.billingAddress;
//
//
//var itemAmountDetailsOptions:any = {
//	shippingFee: "14.00",
//	tax: "5.00",
//	subTotal: "50.00" 
//};
//
//var itemAmountOptions:any = {
//	currency: "PHP",
//	value: "69.00"
//};
//
//var itemOptions:any = {
//	name: "Leather Belt",
//	code: "pm_belt",
//	description: "Medium-sv"
//};
//
//var itemAmountDetails = new ItemAmountDetails();
//itemAmountDetails.shippingFee = itemAmountDetailsOptions.shippingFee;
//itemAmountDetails.tax = itemAmountDetailsOptions.tax;
//itemAmountDetails.subTotal = itemAmountDetailsOptions.subTotal;
//itemAmountOptions.details = itemAmountDetails;
//
//var itemAmount = new ItemAmount();
//itemAmount.currency = itemAmountOptions.currency;
//itemAmount.value = itemAmountOptions.value;
//itemAmount.details = itemAmountOptions.details;
//itemOptions.amount = itemAmount;
//itemOptions.totalAmount = itemAmount;
//
///**
//* Contruct item here
//*/
//var item:any = new Item();
//item.name = itemOptions.name;
//item.code = itemOptions.code;
//item.description = itemOptions.description;
//item.amount = itemOptions.amount;
//item.totalAmount = itemOptions.totalAmount;
//
//// Add all items here
//var items:any = [];
//items.push(item);
//
//var checkout = new Checkout();
//checkout.buyer = buyer;
//checkout.totalAmount = itemOptions.totalAmount;
//checkout.requestReferenceNumber = ref_num;
//checkout.items = items;
//
//checkout.execute(function (error:any, response:any) {
//    if (error) {
//        // handle error
//    } else {
//        // track response.checkoutId
//        // redirect to response.redirectUrl
//	console.log(response);
//    }
//});
//
//console.log(checkout.retrieve(callback));
//
