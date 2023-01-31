const express = require("express")
const app =express()
const bodyParser = require('body-parser')
const mongoroWaitlistRoute = require('./routes/mongoro/waitlist/api')
const reefWaitlistRoute = require('./routes/reef/waitlist/api')
const mongoroAuth = require('./routes/mongoro/auth/api')
const mongoroAuthKyc = require('./routes/mongoro/auth/kyc')
const mongoroUser = require('./routes/mongoro/user/api')
const mongoroMpos = require('./routes/mongoro/mpos/pos')
const mongoroSuperAdmin = require('./routes/mongoro/Admin/super/api')
const mongoroTransaction = require('./routes/mongoro/Transaction/api')
const mongoroTickets = require('./routes/mongoro/Tickets/api')
const mongoroSuperAdminCategory = require('./routes/mongoro/Admin/super/category/category')
const mongoose=require('mongoose')
const cors = require('cors')
// const dotenv = require("dotenv")
// dotenv.config()


app.use(bodyParser.json())

app.use(cors())

app.use("/mongoro_waitlist", mongoroWaitlistRoute)
app.use("/reef_waitlist", reefWaitlistRoute)
app.use("/mongoro/auth", mongoroAuth)
app.use("/mongoro/auth/kyc", mongoroAuthKyc)
app.use("/mongoro/user", mongoroUser)
app.use("/mongoro/pos", mongoroMpos)
app.use("/mongoro/transaction", mongoroTransaction)
app.use("/mongoro/admin/super", mongoroSuperAdmin)
app.use("/mongoro/tickets", mongoroTickets)
app.use("/mongoro/super_admin/category", mongoroSuperAdminCategory)


// Add headers
app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});


mongoose.set("strictQuery", true);
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MongoDB Connected!!!")
    })
    .catch((err) => console.log(err));

const port = process.env.PORT || 3000; 
app.listen(port, () => {
    console.log('Server is running on port '+port);
})
