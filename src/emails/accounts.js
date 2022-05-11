const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
   service: 'hotmail',
   auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD,
   },
});

const send = function (option) {
   transporter.sendMail(
      option,
      function (error, info) {
         if (error) return console.log(error);

         console.log(`Sent: ${info.response}`);
      }
   );
};

const sendWelcome = (email, name) => {
   const options = {
      from: 'verifying_login@outlook.com',
      to: email,
      subject: 'Thank you for signing up.',
      text: `Hello, ${name}, welcome to the Task App!`,
   };
   send(options);
};

const sendCancel = (email, name) => {
   const options = {
      from: 'verifying_login@outlook.com',
      to: email,
      subject: 'Account cancelled.',
      text: `Hello, ${name}, Your account in Task App has been removed. `,
   };
   send(options);
};
module.exports = {sendWelcome, sendCancel};
