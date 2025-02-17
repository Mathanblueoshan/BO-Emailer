const express = require("express");
const app = express();
const emailRoutes = require("./routes/email")




app.use("/emailer",emailRoutes)


app.listen(3000,() => {
  console.log("Emailer running on 3000");
})




