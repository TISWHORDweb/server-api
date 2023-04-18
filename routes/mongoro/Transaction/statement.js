const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const Flutterwave = require('flutterwave-node-v3');
// const view = require('')
const TransferModel = require('../../../models/mongoro/transaction/api')
const nodemailer = require('nodemailer');
const pdf = require('pdf-creator-node');
const fs = require("fs")
const path = require("path");
const MongoroUserModel = require('../../../models/mongoro/auth/mongoroUser_md');
// const ejs = require("ejs");
// const html_to_pdf = require('html-pdf-node');

router.get("/get/:id/:from/:to", async (req, res) => {
    try {

        const statement = await TransferModel.find({ $and: [{ userId: req.params.id }, { "Date": { $gte: req.params.from } }, { "Date": { $lte: req.params.to } }] })

        console.log(statement)
        res.status(200).json({
            msg: 'Account Statement fetch Successfully ',
            status: 200,
            statement
        })

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})



router.post("/send", async (req, res) => {

    const data = await TransferModel.find({ $and: [{ userId: req.body.userId, status: 'successful' }, { "Date": { $gte: req.body.startDate } }, { "Date": { $lte: req.body.endDate } }] })
    const user = await MongoroUserModel.findOne({ _id: req.body.userId })
    const accountNumber = user.account.account_number
    let lastData = data[data.length - 1]
    const closeBalance = lastData.balance
    const openBalance = data[0].balance

    const arr = []
    const arr2 = []
    data.forEach(function (data) {
        arr.push(parseInt(data.credit_amount));
        arr2.push(parseInt(data.debit_amount));
    });


    var fromDate = new Date(parseInt(req.body.startDate));
    var toDate = new Date(parseInt(req.body.endDate));

    // Get individual date components
    var years = fromDate.toDateString()
    var year = toDate.toDateString()

    const fromFormat = years 
    const toFormat = year 

    function sum(input) {

        if (toString.call(input) !== "[object Array]")
            return false;

        var total = 0;
        for (var i = 0; i < input.length; i++) {
            if (isNaN(input[i])) {
                continue;
            }
            total += Number(input[i]);
        }
        return total;
    }

    const totalDebit = sum(arr2)
    const totalCredit = sum(arr)

    const options = {
        format: "A3",
        orientation: "portrait",
        border: "10mm",
        header: {
            height: "40mm",
            contents: '<div style="text-align: center;">Account statement</div>'
        },
        footer: {
            height: "25mm",
            contents: {
                first: 'Cover page',
                2: 'Second page', // Any page number is working. 1-based index
                default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                last: 'Last Page'
            }
        }
    };


    const html = fs.readFileSync(path.join(__dirname, '../../../views/template.html'), 'utf-8');
    const filename = Math.random() + '_doc' + '.pdf';
    let array = [];

    const today = new Date()

    var amOrPm = today.getHours() >= 12 ? "PM" : "AM";
    const Format = today.toDateString() + ", " + today.getHours() + ":" + today.getMinutes()+ " "+amOrPm

    data.forEach(d => {

        const dates = new Date(d.Date);
         // Determine AM or PM
         var amOrPm = dates.getHours() >= 12 ? "PM" : "AM";
        const dateFormat = dates.toDateString() + ", " + dates.getHours() + ":" + dates.getMinutes()+ " "+amOrPm

        const prod = {
            Date: dateFormat,
            reference: d.reference,
            amount: d.amount,
            debit_amount: d.debit_amount,
            credit_amount: d.credit_amount,
            balance: d.balance,
            service_type: d.service_type
        }
        array.push(prod);
    });

    const result = {
        totalCredit: totalCredit,
        close: closeBalance,
        open: openBalance,
        totalDebit: totalDebit,
        accountNumber: accountNumber,
        from: fromFormat,
        to: toFormat,
        today: Format,
    }

    let subtotal = 0;
    array.forEach(i => {
        subtotal += i.total
    });
    const tax = (subtotal * 20) / 100;
    const grandtotal = subtotal - tax;
    const obj = {
        prodlist: array,
        subtotal: subtotal,
        tax: tax,
        gtotal: grandtotal
    }
    const document = {
        html: html,
        data: {
            products: obj,
            topList: result
        },
        path: './docs/' + filename
    }
    pdf.create(document, options)
        .then(res => {
            console.log(res);

            let transporter = nodemailer.createTransport({
                service: "hotmail",
                auth: {
                    user: 'support@mongoro.com',
                    pass: 'cmcxsbpkqvkgpwmk'
                }
            });
    
            let mailOptions = {
                from: 'support@mongoro.com',
                to: req.body.email,
                subject: 'Account statements',
                text: 'Mongoro transaction statements',
                attachments: [{
                    filename: filename,
                    path: res.filename,
                    contentType: 'application/pdf'
                }],
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }).catch(error => {
            console.log(error);
        });
    // const filepath = 'http://localhost:3001/docs/' + filename;

    res.status(200).json({
        msg: 'Account statement generated successfully',
        status: 200
    })

})


module.exports = router