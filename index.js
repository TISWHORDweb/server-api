const express = require("express")
const app =express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoroWaitlistRoute = require('./routes/mongoro/waitlist/api')
const reefWaitlistRoute = require('./routes/reef/waitlist/api')
const mongoroAuth = require('./routes/mongoro/auth/api')
const mongoroAuthKyc = require('./routes/mongoro/auth/kyc')
const mongoroUser = require('./routes/mongoro/user/api')
const mongoroMpos = require('./routes/mongoro/mpos/pos')
const mongoroAccount = require('./routes/mongoro/user/account')
const mongoroSuperAdmin = require('./routes/mongoro/Admin/super/api')
const mongoroTransaction = require('./routes/mongoro/Transaction/api')
const mongoroTickets = require('./routes/mongoro/Tickets/api')
const mongoroAdminMessage = require('./routes/mongoro/Admin/other/chat/chat')
const mongoroUserMessage = require('./routes/mongoro/user/chat')
const mongoroU_verify = require('./routes/mongoro/user/u_verify')
const mongoroSuperAdminCategory = require('./routes/mongoro/Admin/super/category/category')
const mongoroAppmessage = require('./routes/mongoro/Admin/other/broadcast/appmessage')
const mongoroStatement = require('./routes/mongoro/Transaction/statement')
const mongoroWebhook = require('./routes/mongoro/Transaction/webhook')
const mongoroWithdraw = require('./routes/mongoro/Transaction/withdraw')
const mongoroState = require('./routes/state')
const mongoroAdmin = require('./routes/mongoro/Admin/admin')
const mongoroBank = require('./routes/mongoro/user/bank')
const mongoroOther = require('./routes/mongoro/Admin/other/other_admin')
const mongoroTotal = require('./routes/mongoro/total/total')
const mongoroActivity = require('./routes/mongoro/user/loginActivity')
const mongoroBenefiaciary = require('./routes/mongoro/Transaction/beneficiary')
const mongoose=require('mongoose')

// const dotenv = require("dotenv")
// dotenv.config()

// app.use(cors({"origin":"*"}))
app.use(cors({"origin":"*"}))

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", '*');
//     res.header("mode","no-cors")
 
// })

app.use(bodyParser.json())


app.use("/mongoro/total", mongoroTotal)
app.use("/mongoro/other", mongoroOther)
app.use("/mongoro_waitlist", mongoroWaitlistRoute)
app.use("/reef_waitlist", reefWaitlistRoute)
app.use("/mongoro/auth", mongoroAuth)
app.use("/mongoro/auth/kyc", mongoroAuthKyc)
app.use("/mongoro/user", mongoroUser)
app.use("/mongoro/pos", mongoroMpos)
app.use("/mongoro/login_activity", mongoroActivity)
app.use("/mongoro/transaction", mongoroTransaction)
app.use("/mongoro/admin/super", mongoroSuperAdmin)
app.use("/mongoro/tickets", mongoroTickets)
app.use("/mongoro/usermessage", mongoroUserMessage)
app.use("/mongoro/adminmessage", mongoroAdminMessage)
app.use("/mongoro/super_admin/category", mongoroSuperAdminCategory)
app.use("/mongoro/broadcast", mongoroAppmessage)
app.use("/mongoro/verify", mongoroU_verify)
app.use("/mongoro/account", mongoroAccount)
app.use("/mongoro", mongoroWebhook)
app.use("/mongoro/bank", mongoroBank)
app.use("/mongoro/admin", mongoroAdmin)
app.use("/mongoro/state", mongoroState)
app.use("/mongoro/withdraw", mongoroWithdraw)
app.use("/mongoro/statement", mongoroStatement)
app.use("/mongoro/beneficiary", mongoroBenefiaciary)



mongoose.set("strictQuery", true);
mongoose .connect("mongodb+srv://mongoro:mongoro@mongoro.dbwd7pc.mongodb.net/?retryWrites=true&w=majority")
    // .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Database Connected")
    })
    .catch((err) => console.log(err));

const port = process.env.PORT || 3000; 
app.listen(port, () => {
    console.log('Server is running on port '+port);
})

