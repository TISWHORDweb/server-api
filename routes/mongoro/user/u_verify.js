const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const bcrypt = require('bcryptjs')
const axios = require('axios')
const MongoroUserModel = require('../../../models/mongoro/auth/mongoroUser_md')
const BvnDefaultModel = require('../../../models/mongoro/auth/user/verification/u-verify_md')


router.post('/', async (req, res) => {

    const alph = 'abcdefghijklmnopqrstuvwxyz'
    function generateRandomLetter() {
        return alph[Math.floor(Math.random() * alph.length)]
    }

    const word = generateRandomLetter()
    const words = generateRandomLetter()

    const num = Math.floor(100 + Math.random() * 900)
    const bvn = req.body.b_id
    const lastName = req.body.lastName
    const firstName = req.body.firstName
    const middleName = req.body.middleName
    const email = req.body.email
    const phone = req.body.phone

    const check = bvn.substr(bvn.length - 4)

    const url = "https://api.sandbox.youverify.co/v2/api/identity/ng/bvn"

    const header = {
        headers: {
            token: "PX5PKOeq.kxH0ThxPCDj2HidqDZMV0x0iw9TMXp7Z6z42"
        }
    }

    try {

        const validate = await BvnDefaultModel.findOne({ check: "MON" + check + "GORO" })
        
        function statement (){
            const checking = validate.data.datas.data

            if (checking.firstName !== firstName) {
                res.send("first name does not math")
            } else if (checking.lastName !== lastName) {
                res.send("lastName does not math")
            } else if (checking.middleName !== middleName) {
                res.send("middleName does not math")
            } 
        }

        if (validate) {
            statement()
            let user = await MongoroUserModel.find({ email: email })
            res.send(user)
            console.log(validate)
        } else{
            console.log("account")

        await axios.post(url, {
            "id": bvn,
            "isSubjectConsent": true
        }, header).then(resp => {
            const data = resp.data.data
            const datas = resp.data
            if (!data) {
                res.status(402).json({ msg: 'BVN not found ?' })
            }
            if (data.lastName !== lastName) {
                res.status(402).json({ msg: 'last name does not match ?' })
            } else if (data.firstName !== firstName) {
                res.status(402).json({ msg: 'first name does not match ?' })
            } else if (data.middleName !== middleName) {
                res.status(402).json({ msg: 'middle name does not match ?' })
            } else {
                console.log({msg: "All details match "})
                var body = JSON.stringify({
                    "email": "developers@flutterwavego.com",
                    "is_permanent": true,
                    "bvn": "12345678901",
                    "tx_ref": "VA12",
                    "phonenumber": "08109328188",
                    "firstname": "Angela",
                    "lastname": "Ashley",
                    "narration": "Angela Ashley-Osuzoka"
                });
    
                var config = {
                    method: 'post',
                    url: 'https://api.flutterwave.com/v3/virtual-account-numbers',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer FLWSECK_TEST-141328841fb7943a7b8d1788f0377d3c-X'
                    },
                    data: body
                };
    
                axios(config)
                    .then(function (response) {
                        console.log(JSON.stringify(response.data));
                        const acc = response.data
                        MongoroUserModel.updateOne({ email: email }, { $set: { account: acc , verification:{bvn: true}} }).then(async () => {
    
                            let details = await MongoroUserModel.findOne({ email: email })
    
                            console.log(details)
                            res.send({account: acc})
                        })
    
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
    
                if (req.body.b_id) {
                    req.body.b_id = bcrypt.hash(req.body.b_id, 13)
                }
    
                const bodys = {
                    "b_id": bvn,
                    "check": "MON"+check+"GORO",
                    "data": { datas }
                }
    
                let details = new BvnDefaultModel(bodys)
    
                details.save()
                console.log(details)
            }

        })
        }

        // const body =  JSON.stringify({
        //     "email": email,
        //     "is_permanent": true,
        //     "bvn": bvn,
        //     "tx_ref": word + words + num,
        //     "phonenumber": phone,
        //     "firstname": firstName,
        //     "lastname": lastName
        // })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.get("/banks", async (req, res) => {
    const url = "https://api.sandbox.youverify.co/v2/api/identity/ng/bank-account-number/bank-list"

    const header = {
        headers: {
            token: "PX5PKOeq.kxH0ThxPCDj2HidqDZMV0x0iw9TMXp7Z6z42"
        }
    }
    try {
        await axios.get(url, header).then(resp => {
            res.status(200).json(resp.data)
        })
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})



router.get("/all",  async (req, res) => {
    try {
        const details = await BvnDefaultModel.find();
        res.status(200).json(details.reverse());
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.post('/details', async (req, res) => {

    try {
        if (!req.body.account_number || !req.body.account_bank) return res.status(402).json({ msg: 'provide the fields ?', status: 402 })

        const validate = await MongoroUserModel.findOne({ "account.data.account_number": req.body.account_number })
        if (validate) {
            res.send(validate)
        } else {
            res.send("not found")
        }


    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.delete("/delete", async (req, res) => {
    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?' })

        await BvnDefaultModel.deleteOne({ _id: req.body.id })
        res.status(200).json("Bvn deleted....");
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

});

router.get("/:id", verify, async (req, res) => {
    try {
        if (!req.params.id) return res.status(402).json({ msg: 'provide the id ?' })

        let user = await BvnDefaultModel.find({ _id: req.params.id })
        res.status(200).json(user);

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

module.exports = router