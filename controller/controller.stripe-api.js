const express = require('express')
const dotenv = require("dotenv")
dotenv.config()
const { useAsync, utils, errorHandle, } = require('../core');
const MindCastUser = require('../models/model.user');
const MindCastCoupon = require('../models/model.cuponCodes');
const nodemailer = require('nodemailer');
const handlebars = require("handlebars")
const fs = require("fs")
const path = require("path");
const MindCastCouponPayment = require('../models/model.couponPayment');
const stripe = require('stripe')(process.env.SECRET_STP_KEY)



exports.createStripeCustomer = useAsync(async (req, res) => {

    try {
        const user = await MindCastUser.findOne({ _id: req.body.user_id, email: req.body.CUSTOMER_EMAIL });
        let stripeCustomer = null

        if (user != null && user.stripe_customer_id == null) {
            const customer = await stripe.customers.create({
                email: req.body.CUSTOMER_EMAIL,
                name: req.body.CUSTOMER_NAME,
                shipping: {
                    address: {
                        city: 'Brothers',
                        country: 'US',
                        line1: '27 Fredrick Ave',
                        postal_code: '97712',
                        state: 'CA',
                    },
                    name: req.body.CUSTOMER_NAME,
                },
                address: {
                    city: 'Brothers',
                    country: 'US',
                    line1: '27 Fredrick Ave',
                    postal_code: '97712',
                    state: 'CA',
                },
            });
            await MindCastUser.updateOne({ _id: req.body.user_id }, { 'stripe_customer_id': customer.id })
            stripeCustomer = await MindCastUser.findOne({ _id: req.body.user_id });
        } else if (user != null && user.stripe_customer_id != null) {
            stripeCustomer = await MindCastUser.findOne({ _id: req.body.user_id });
        }

        if (stripeCustomer != null) {
            const ephemeralKey = await stripe.ephemeralKeys.create(
                { customer: stripeCustomer.stripe_customer_id },
                { apiVersion: '2020-08-27' }
            );
            const setupIntent = await stripe.setupIntents.create({
                customer: stripeCustomer.stripe_customer_id,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            let response = {
                setupIntent: setupIntent.client_secret,
                ephemeralKey: ephemeralKey.secret,
                customer: stripeCustomer.stripe_customer_id,
            }


            return res.json(utils.JParser('Payment details Successfully', !!response, response));
        } else {
            return res.json(utils.JParser('Customer does not exist', false));
        }



    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})


exports.createStripeSubscription = useAsync(async (req, res) => {

    const customerId = req.body.customerId;
    const priceId = req.body.priceId;

    try {
        // Create the subscription. Note we're expanding the Subscription's
        // latest invoice and that invoice's payment_intent
        // so we can pass it to the front end to confirm the payment
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{
                price: priceId,
            }],
            trial_end: 1720166677,
            billing_cycle_anchor: 1722845077,
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
        });
        await MindCastUser.updateOne({ _id: req.body.user_id }, { 'subscription_id': subscription.id })
        console.log(subscription);
        let subObject = {
            subscriptionId: subscription.id,
        }

        return res.json(utils.JParser('Subscription Created Successfully', true, subObject));

    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})

exports.createPaymentMethod = useAsync(async (req, res) => {

    const customerId = req.body.customerId;


    try {
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customerId },
            { apiVersion: '2020-08-27' }
        );
        const setupIntent = await stripe.setupIntents.create({
            customer: customerId,
            automatic_payment_methods: {
                enabled: true,
            },
        });
        let response = {
            setupIntent: setupIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customerId,
        }

        return res.json(utils.JParser('Subscription Created Successfully', true, response));

    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})

exports.cancelSubscription = useAsync(async (req, res) => {


    try {


        const user = await MindCastUser.findOne({ _id: req.body.user_id });
        if (user != null && user.subscription_id!=null) {
            const deletedSubscription = await stripe.subscriptions.del(req.body.subscriptionId);

            await MindCastUser.updateOne({ _id: req.body.user_id }, { 'subscription_id': null })
            console.log(deletedSubscription);

            let newUser = await MindCastUser.findOne({ _id: req.body.user_id });

            return res.json(utils.JParser('Subscription canceled Successfully', true, newUser));
        } else if(user.subscription_id==null) {
            return res.json(utils.JParser('User does not have an active subscription ', false));
        }else {
            return res.json(utils.JParser('User does not exits ', false));
        }




    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})