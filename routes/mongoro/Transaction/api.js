const express = require('express')
const router = express.Router()


router.post('/retry', async (req, res) => {

    var request = require('request');
    var options = {
        'method': 'POST',
        'url': 'https://api.flutterwave.com/v3/transfers/390086/retries',
        'headers': {
            'Authorization': 'Bearer FLWSECK_TEST-SANDBOXDEMOKEY-X',
            'Content-Type': 'application/json'
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
    });

})

router.get('/getamount', async (req, res) => {

    var request = require('request');
    var options = {
      'method': 'GET',
      'url': 'https://api.flutterwave.com/v3/transfers/fee?amount=1500',
      'headers': {
        'Authorization': 'Bearer FLWSECK_TEST-SANDBOXDEMOKEY-X'
      }
    };
    request(options, function (error, response) { 
      if (error) throw new Error(error);
      console.log(response.body);
    });

})

module.exports = router