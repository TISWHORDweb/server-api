const express = require('express')
const dotenv = require("dotenv")
dotenv.config()
const { useAsync, utils, errorHandle, } = require('../core');
const MindCastUser = require('../models/model.user');
const MindCastCoupon = require('../models/model.cuponCodes');
const nodemailer = require('nodemailer');
const handlebars = require("handlebars")
const bcrypt = require('bcryptjs')
const fs = require("fs")
const path = require("path");
const MindCastCouponPayment = require('../models/model.couponPayment');
const stripe = require('stripe')(process.env.SECRET_STP_KEY)



exports.stripePayment = useAsync(async (req, res) => {

    await MindCastCouponPayment.create({email:req.body.email, status:"pending"})

        const paymentLink = await stripe.paymentLinks.create({
            line_items: [
              {
                price: 'price_1PYiYOGrAkA0etTmGTQus5p9',
                quantity: req.body.totalUsers,
              },
            ],
            after_completion: {
              type: 'redirect',
              redirect: {
                url: `https://mindcast-project.onrender.com/checkout?email=${req.body.email}&totalUsers=${req.body.totalUsers}&assignedName=${req.body.assignedName}&totalMonths=${req.body.totalMonths}`,
            
              },
            },
          });
          console.log(paymentLink);
          let data={data:req.body, paymentLink:paymentLink}
          return res.json(utils.JParser('Subscription link', true, data));
    
      

})

exports.generateCoupon = useAsync(async (req, res) => {

    try {

        const payment = await MindCastCouponPayment.findOne({ email: req.body.email });

        if(payment==null){
            let assignedName = req.body.assignedName
            let totalUsers = req.body.totalUsers
            let totalMonths = req.body.totalMonths;
            let email = req.body.email
            let hasAccount=false;

            let user = await MindCastUser.findOne({ email: req.body.email });
            if(user==null){
                req.body.password = await bcrypt.hash("Life123", 13)
                req.body.username = req.body.assignedName
                let newUser=await new MindCastUser(req.body)
                user=await newUser.save();
            }else{
             hasAccount=true
            }
    
             let allCodes=``
            for (let i = 0; i < totalUsers; i++) {
    
                function randomString(length, chars) {
    
                    var result = '';
                    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
                    return result;
                }
                let code = randomString(8, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
    
                allCodes+=`<li>Code-${i+1} - <b>${code}</b></li> \n`
                let cupon = { "coupon": code, "email": email, "duration": totalMonths, "price": 0, "assignedName": assignedName, companyID:user.id }
                
                await MindCastCoupon.create(cupon)
               
            }
           

            const coupons = await MindCastCoupon.find({ email: req.body.email });
            console.log(allCodes);
    
            let transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: 465,
                encoding:"ssl",
                secure: true,
                auth: {
                    user: process.env.EMAIL_ADDRESS,
                    pass: process.env.APP_PASSWORD
                }
            });
    
            const emailTemplateSource = fs.readFileSync(path.join(__dirname, "../views/mailTemplate-promo.hbs"), "utf8")
            const template = handlebars.compile(emailTemplateSource)
            const htmlToSend = template({ name: req.body.assignedName, coupons:coupons, allCodes:allCodes, totalUsers:totalUsers, hasAccount:hasAccount, password:"Life123", email:req.body.email })
    
            let mailOptions = {
                from: "Mindcasts App  noreply@mindcasts.life",
                to: req.body.email,
                subject: `${req.body.assignedName} - Subscription Codes`,
                html: htmlToSend,
            };
    
           
    
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            
            await MindCastCouponPayment.deleteOne({ email: req.body.email });

            return res.json(utils.JParser('Subscription created successfully', !!coupons, coupons));
        }else{
            return res.json(utils.JParser('No subscription has been paid yet', false, ));
        }
        

    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})


exports.assigncoupon = useAsync(async (req, res) => {

    try {
        const coupon = await MindCastCoupon.findOne({ coupon: req.body.code });
        
        if (coupon != null) {

            if (coupon.status == "pending") {
                let totalDuration = coupon.duration;
                var now = new Date();
                var endDate
                if(coupon.duration_type=="month"){
                    const now = new Date();
                    const resultDate = new Date(now);
                    endDate=resultDate.setMonth(now.getMonth() + months); 
                }else if(coupon.duration_type=="week"){
                    const now = new Date();
                    const resultDate = new Date(now);
                    endDate=resultDate.setDate(now.getDate() + totalDuration * 7); // Adds the number of days equivalent to the weeks
                }else if(coupon.duration_type=="day"){
                    const now = new Date();
                    const resultDate = new Date(now);
                    endDate=resultDate.setDate(now.getDate() + totalDuration); 
                }

                let expDate = Math.floor(new Date(endDate).getTime()/1000.0)

                await MindCastCoupon.updateOne({ _id: coupon._id }, { exp_date: expDate, userID: req.body.userID, status: "active" })

                await MindCastUser.updateOne({ _id: req.body.userID }, {"status":"paid","subscription_product":"coupon","subscription_end_date":endDate})

                const updatedCoupon = await MindCastCoupon.find({ _id: coupon._id });

                return res.json(utils.JParser('Subscription fetch successfully', !!updatedCoupon, updatedCoupon));
            } else {
                return res.json(utils.JParser('Subscription code already in use ', false));
            }

        } else {
            return res.json(utils.JParser('Subscription not found', false));
        }

    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})


exports.checkActivecoupons = useAsync(async (req, res) => {
    try {

        const coupons = await MindCastCoupon.find({ status: "active" });

        coupons.forEach( async data => {

            const firstDate = new Date(data.exp_date)
            const secondDate = new Date().getTime()/1000

            if(firstDate < secondDate){
                await MindCastCoupon.updateOne({ _id: data._id }, { status: "expired", userID:null })
                await MindCastUser.updateOne({ _id: data.userID }, {"status":"free","subscription_product":null, 'subscription_end_date':null})
            }

        


        });

        return res.json(utils.JParser('Subscriptions Updated', true));

    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})

exports.singlecoupon = useAsync(async (req, res) => {

    try {
        const coupon = await MindCastCoupon.findOne({ _id: req.params.id }).populate("userID", "_id username email ").populate("companyID", "_id username email ");
        return res.json(utils.JParser('Subscription fetch successfully', !!coupon, coupon));
    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})

exports.allcoupon = useAsync(async (req, res) => {

    try {
        const coupon = await MindCastCoupon.find().populate("userID", "_id username email ").populate("companyID", "_id username email ");
        return res.json(utils.JParser('Subscription fetch successfully', !!coupon, coupon));
    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})


exports.cancelCoupon = useAsync(async (req, res) => {
    try {

        const user = await MindCastUser.findOne({ _id: req.body.user_id });
        if (user != null && user.subscription_product == "coupon") {

            await MindCastUser.updateOne({ _id: req.body.user_id }, { 'subscription_id': null, 'status': "free", 'mindCastSubscription_id': null,'subscription_product':null, 'subscription_end_date':null })
            let coupon=await MindCastCoupon.findOne({ userID: req.params.user_id })
            await MindCastCoupon.updateOne({ _id: coupon.id }, {userID:null, status:"pending"})

            return res.json(utils.JParser('Coupon Subscription canceled Successfully', false));


        } else if (user.subscription_product == null) {
            return res.json(utils.JParser('User does not have an active coupon ', false));
        } else {
            return res.json(utils.JParser('User does not exits ', false));
        }




    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})

exports.usercoupon = useAsync(async (req, res) => {

    try {
        const coupon = await MindCastCoupon.find({ userID: req.params.id }).populate("userID", "_id username email ").populate("companyID", "_id username email ");
        return res.json(utils.JParser('User Subscription fetch successfully', !!coupon, coupon));
    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})

exports.companyCoupons = useAsync(async (req, res) => {

    try {
        const coupon = await MindCastCoupon.find({ email: req.body.email }).populate("userID", "_id username email ").populate("companyID", "_id username email ");
        return res.json(utils.JParser('Company coupons fetch successfully', !!coupon, coupon));
    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})

exports.activeCompanyCoupons = useAsync(async (req, res) => {

    try {
        const coupon = await MindCastCoupon.find({ email: req.body.email, status:"active" }).populate("userID", "_id username email ").populate("companyID", "_id username email ");
        return res.json(utils.JParser('Company Active fetch successfully', !!coupon, coupon));
    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})

exports.companyCouponSummary = useAsync(async (req, res) => {

    try {

        const companyEmail= req.body.email;

        // Validate the email address
        if (!companyEmail) {
            
            return res.json(utils.JParser('Company email is required', false, {}));
        }

        // Find the company by email
        const company = await MindCastUser.findOne({ email: companyEmail });

        if (!company) { 
            return res.json(utils.JParser('Company not found', false, {}));
        }

        const email = company.email;

        // Query the coupon model using the company ID
        const totalCouponActive = await MindCastCoupon.countDocuments({
            email,

            status: 'active',
        });

        const totalCouponExpired = await MindCastCoupon.countDocuments({
            email,
            status: 'expired',
        });

        const totalPending = await MindCastCoupon.countDocuments({
            email,
            status: 'pending',
        }); 

        const totalCoupon = await MindCastCoupon.countDocuments({
            email, 
        }); 
 
        const couponsWithUserID = await MindCastUser.find({ email, userID: { $exists: true, $ne: null } });

        console.log(couponsWithUserID);

        return res.json(utils.JParser('Company Active fetch successfully', true, {
            totalCoupon,
            totalUsers:couponsWithUserID.length,
            totalCouponActive,
            totalCouponExpired,
            totalPending}));
    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})


exports.updateCoupons = useAsync(async (req, res) => {

    try {
        let coupon =null
         await MindCastCoupon.updateOne({ _id: req.body.coupon_id }, req.body ).then(async () => {
            coupon = await MindCastCoupon.findOne({ _id: req.body.coupon_id})
        });
        return res.json(utils.JParser('coupons fetch successfully', !!coupon, coupon));
    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})


exports.deletecoupon = useAsync(async (req, res) => {
    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ' })

        await MindCastCoupon.deleteOne({ _id: req.body.id })
        return res.json(utils.JParser('Subscription deleted successfully', true, []));

    } catch (e) {
        throw new errorHandle(e.message, 400)
    }

});
