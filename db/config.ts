const  config = {
    user:  process.env.USER, // sql user
    password:  process.env.PASSWORD, //sql user password
    server:  process.env.SERVER, // if it does not work try- localhost
    database:  process.env.DATABASE,
    options: {
      trustedconnection:  true,
      enableArithAbort:  true,
      trustServerCertificate: true,

    },
    port:  1433
  }
  
  module.exports = config;