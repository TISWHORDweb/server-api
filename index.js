const express = require("express")
const app =express()
const bodyParser = require('body-parser')
const mongoroWaitlistRoute = require('./routes/mongoro/waitlist/api')
const reefWaitlistRoute = require('./routes/reef/waitlist/api')
const mongoroAuth = require('./routes/mongoro/auth/api')
const mongoose=require('mongoose')
const cors = require('cors')
// const dotenv = require("dotenv")
// dotenv.config()


app.use(bodyParser.json())

app.use(cors())


app.use("/mongoro_waitlist", mongoroWaitlistRoute)
app.use("/reef_waitlist", reefWaitlistRoute)
app.use("/mongoro/auth", mongoroAuth)


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