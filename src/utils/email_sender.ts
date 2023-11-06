import * as config from '../config/config';
import { MailerSend, EmailParams, Sender, Recipient, Attachment } from 'mailersend';
import * as nodemailer from 'nodemailer';

const mailerSend = new MailerSend({
  apiKey: config.env.MAILER_API_KEY
})

const sentFrom = new Sender("nesthy@retailgate.tech", "Greetings PH")

export const EmailUtils = {
  // Send email using Mailersend
  async sendEmailMS(emailAdd:any, full_name:any, subject:any, emailBody:any, attachments:any) {
    const response = await new Promise(async (resolve, reject) => {
      try{
      const recipients = [
        new Recipient(emailAdd, full_name)
      ];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        //.setAttachments(attachments)
        .setSubject(subject)
        .setHtml(emailBody);

      await mailerSend.email.send(emailParams);
      resolve(true);
      } catch(err){
        console.log(err);
      } 
    });
    return response;
  },

  async sendBulk(admin_details:any, attachment:any) {  
    const response = await new Promise(async (resolve, reject) => {
      try{
        console.log("AAAAA");
        var recipients:any = [];

        /*const attachments = [
          new Attachment(
            attachment[0].b64,
            attachment[0].fname,
            'attachment',
            //'0123456789'
          )
        ]*/

        for(let admin in admin_details){
          recipients.push(new EmailParams()
            .setFrom(sentFrom)
            .setTo([ new Recipient(admin_details[admin].emailAddr, admin_details[admin].fullName)])
            .setReplyTo(sentFrom)
            //.setAttachments(attachments)
            .setSubject(admin_details[admin].subject)
            .setHtml(admin_details[admin].emailBody)
          )
        }

        try{
        await mailerSend.email.sendBulk(recipients);
        } catch(err){
          console.log(err);
        }
        resolve(true);
      } catch(err){
        console.log(err);
      } 
    });
    return response;    
  },

  async sendEmailMS_withCC(recipients:any, ccs:any, subject:any, emailBody:any, attachments:any) {
    const response = await new Promise(async (resolve, reject) => {
      try{

      const processed_recipients:any = [];
      const processed_ccs:any = [];

      if(recipients.length){
        for(let r in recipients){
          processed_recipients.push(new Recipient(recipients[r].emailAddr, recipients[r].fullName));
        }
      }

      if(ccs.length){
        for(let c in ccs){
          processed_ccs.push(new Recipient(ccs[c].emailAddr, ccs[c].fullName));
        }
      }

      var emailParams:any;

      if(ccs.length){
        emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(processed_recipients)
        .setCc(processed_ccs)
        .setReplyTo(sentFrom)
        //.setAttachments(attachments)
        .setSubject(subject)
        .setHtml(emailBody);
      } else{
        emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(processed_recipients)
        .setReplyTo(sentFrom)
        //.setAttachments(attachments)
        .setSubject(subject)
        .setHtml(emailBody);
      }

      await mailerSend.email.send(emailParams);
      resolve(true);
      } catch(err){
        console.log(err);
      } 
    });
    return response;
  },

  async sendEmail(emailAdd:any, subject:any, emailBody:any, attachments:any){
    const response = await new Promise(async (resolve, reject) => {
      var transporter = nodemailer.createTransport({
        //host: 'smtp.larksuite.com',
        service: 'gmail',
        host: 'smtp.gmail.com',
        //port: 465,
        auth: {
          user: config.env.EMAIL,
          pass: config.env.EMAIL_PASS //'RTLchatmaster@2020'
        }
      });
  
      var mailOptions = {
        from: config.env.EMAIL,
        to: emailAdd, //'rienaldnesthy96@gmail.com',
        subject: subject, //'Email Confirmation',
        html: emailBody
      };
  
      //if(attachments){
      //  mailOptions['attachments'] = attachments;
      //}
  
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          //res.status(400).send({"success": false});
        } else {
          console.log('Email sent: ' + info.response);
          console.log('Recipients: ' + emailAdd);
          //res.status(200).send({"success": true});
          resolve(true)
        }
      });
    });
    return response;
  }
}