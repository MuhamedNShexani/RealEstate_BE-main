const  config = {
    user:  'MuhamedShexani', // sql user
    password:  '123456788mmnM', //sql user password
    server:  'localhost', // if it does not work try- localhost
    database:  'RealEstate',
    options: {
      trustedconnection:  true,
      enableArithAbort:  true,
      trustServerCertificate: true,

    },
    port:  1433
  }
  
  module.exports = config;