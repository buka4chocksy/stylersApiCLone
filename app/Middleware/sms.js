const options = {
  apiKey: process.env.SMS_API_KEY, // use your sandbox app API key for development in the test environment
  username: process.env.SMS_USERNAME // use 'sandbox' for development in the test environment
};
const AfricasTalking = require("africastalking")(options);

// Initialize a service e.g. SMS
const sms = AfricasTalking.SMS;
exports.sendToken = (phoneNumber, token) => {
  return new Promise((resolve, reject) => {
    let numba;
    if (phoneNumber.startsWith('0', 0)) {
      var fullNumber = phoneNumber.substr(1);
      numba = "+234" + fullNumber;
    } else {
      numba = phoneNumber;
    }

    // Use the service      
    const option = {
      to: [numba],
      message: `${token} is your Verification code`
    };
    // Send message and capture the response or error
    sms
      .send(option)
      .then(response => {
        console.log(response , 'dddddd')
        resolve(response);
      })
      .catch(error => {
        console.log(error , 'sssss')
        reject(error.message);
      });
  });
};

