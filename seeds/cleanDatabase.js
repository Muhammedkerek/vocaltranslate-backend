const mongoose = require("mongoose");
require("dotenv").config();
const TextToText = require("../models/textToTextSchema");
const AudioToText = require("../models/translationSchema");
const User = require("../models/UserSchema");

mongoose
.connect("mongodb://localhost:27017/vocalDb")
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("Error connecting to MongoDB:", err));







const cleanTextToTextCollection = async()=>{
    try{
         const deleteTextToText = await TextToText.deleteMany({});
         console.log("text-to-text collection was successfully deleted");
         
    }
    catch (error) {
        console.error("Error cleaning the collection:", error);
        process.exit(1); // Exit with a failure code
      }
}

const cleanAudioToTextCollection = async()=>{
    
    try{
        const deleteAudioToText = await AudioToText.deleteMany({});
        console.log("Audio-to-text collection was successfully deleted");   
       
   }
   catch (error) {
       console.error("Error cleaning the collection:", error);
       process.exit(1); // Exit with a failure code
     }
}

const cleanUserCollection = async()=>{
    try{
        const deleteAudioToText = await User.deleteMany({});
        console.log("users collection was successfully deleted"); 
        
   }
   catch (error) {
       console.error("Error cleaning the collection:", error);
       process.exit(1); // Exit with a failure code
     }
}

const disconnect = async()=> 
    {
        try {
            await mongoose.disconnect();
            console.log("Disconnected from MongoDB");
            console.log("All tasks are complete. Database cleanup finished!");
          } catch (error) {
            console.error("Error during disconnect:", error);
          }
    }


const runCleanup = async () => {
    await cleanTextToTextCollection();
    await cleanAudioToTextCollection();
    await cleanUserCollection();
  
    
    setTimeout(() => {
      disconnect();
    }, 5000); 
    
  };
  
runCleanup();

 