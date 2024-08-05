exports.constants = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,  
  auth: {
    user: "haseeb99sh@gmail.com",  
    pass: process.env.MAIL_PASSWORD,  
  },
});

exports.sendMail = async function ({ to, subject, text, html }) {
  let info = await transporter.sendMail({
    from: '"E-Shop" <haseeb99sh@gmail.com>',
    to,
    subject,
    text,
    html,
  });
  return info;
};
