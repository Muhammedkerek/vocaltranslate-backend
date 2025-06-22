const express = require("express");
const app = express();

const AudioToTextRoute = require("./Routes/AudioToTextRoute");
const AuthRoute = require("./Routes/AuthRoute");
const TextToTextRoute = require("./Routes/TextToTextRoute");
const OnlineUsersRoute = require("./Routes/onlineUsersRoute");
const audioToAudioRoutes = require("./Routes/AudioToAudioRoute");

const cors = require("cors");
const mongoose = require("mongoose");


// mongoose
//   .connect("mongodb://localhost:27017/vocalDb")
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("Error connecting to MongoDB:", err));


  mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());



app.get("/home" , (req,res)=>{
    res.send("hamud is here")
})


app.use(express.static(`${__dirname}/starter/public`))


app.use(express.json());

app.use("/api/vocalapp" , AudioToTextRoute);
app.use("/api/vocalapp" , AuthRoute);
app.use("/api/vocalapp" , TextToTextRoute);
app.use("/api/vocalapp" , OnlineUsersRoute);
app.use("/api/audio-to-audio", audioToAudioRoutes);



module.exports = app;