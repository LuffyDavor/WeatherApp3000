const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://luffydavor:luffy7590@weatherappcluster.b5zxfb0.mongodb.net/?retryWrites=true&w=majority")
.then(()=>{
    console.log("mongodb connected");
})
.catch(()=>{
    console.log("failed to connect to mongodb")
})

const logInSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users"
  },
  username: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  }
}); 

const LogInCollection=new mongoose.model('users',logInSchema)
const SearchHistoryCollection = mongoose.model("searchhistory", searchHistorySchema);

module.exports = {
    LogInCollection,
    SearchHistoryCollection
}
