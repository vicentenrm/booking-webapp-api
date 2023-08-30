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