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
    required: true,
    index: { unique: true, sparse: true, partialFilterExpression: { userId: { $type: "objectId" } } }
  }
});

const questionsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users"
  },
  username: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true,
  }
});

const commentsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users"
  },
  username: {
    type: String,
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "questions"
  },
  comment: {
    type: String,
    required: true
  }
});

const LogInCollection=new mongoose.model('users',logInSchema)
const SearchHistoryCollection = mongoose.model("searchhistory", searchHistorySchema);
const QuestionsCollection = mongoose.model("questions", questionsSchema);
const CommentsCollection = mongoose.model("comments", commentsSchema);

module.exports = {
    LogInCollection,
    SearchHistoryCollection,
    QuestionsCollection,
    CommentsCollection
}
