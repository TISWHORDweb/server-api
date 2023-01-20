const express = require("express")
const app =express()
const bodyParser = require('body-parser')
const mongoroWaitlistRoute = require('./routes/mongoro/waitlist/api')
const reefWaitlistRoute = require('./routes/reef/waitlist/api')
const mongoose=require('mongoose')
const cors = require('cors')


app.use(bodyParser.json())

app.use(cors())

app.use("/mongoro_waitlist", mongoroWaitlistRoute)
app.use("/reef_waitlist", reefWaitlistRoute)

mongoose.set("strictQuery", true);
mongoose
    .connect("mongodb+srv://mongoro:mongoro@mongoro.dbwd7pc.mongodb.net/?retryWrites=true&w=majority")
    .then(() => {
        console.log("MongoDB Connected!!!")
    })
    .catch((err) => console.log(err));



const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
    console.log('Server is running on port '+PORT);
})