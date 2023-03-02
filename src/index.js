const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const { LogInCollection } = require("./mongodb");
const { SearchHistoryCollection } = require("./mongodb");
const { QuestionsCollection } = require("./mongodb");
const { CommentsCollection } = require("./mongodb");
const session = require("express-session");

const port = process.env.PORT || 420;

app.use(express.json());
app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: false }));
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

app.use(
  session({
    secret: "7590",
    resave: false,
    saveUninitialized: true,
  })
);

// GET REQUESTS

app.get("/", (req, res) => {
  res.render("home", {
    naming: req.session.username,
    isLoggedIn: req.session.isLoggedIn,
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/logout", (req, res) => {
  req.session.isLoggedIn = false;
  req.session.userId = undefined; // Remove userId from session
  res.redirect("/");
});

app.get("/selectedQuestion/:id", async (req, res) => {
  try {
    req.session.questionId = req.params.id;
    const selectedQuestion = await QuestionsCollection.findById(req.params.id);
    const comments1 = await CommentsCollection.find({ questionId: req.params.id });
    res.render("selectedQuestion", {
      selectedQuestion: selectedQuestion,
      comments: comments1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

app.get("/forum", async (req, res) => {
  try {
    const questions = await QuestionsCollection.find();
    res.render("forum", { questions: questions });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

app.get("/search-history", async (req, res) => {
  if (req.session.isLoggedIn) {
    try {
      const searchHistory = await SearchHistoryCollection.find({ userId: req.session.userId });
      console.log(searchHistory);
      res.status(200).json(searchHistory);
    } catch (err) {
      console.error(err);
      res.status(500).send("An error occurred while retrieving search history");
    }
  }
});

// POST REQUESTS

app.post("/login", async (req, res) => {
  try {
    const check = await LogInCollection.findOne({ username: req.body.username });

    if (check && check.password === req.body.password) {

      req.session.isLoggedIn = true;
      req.session.username = check.username;
      req.session.userId = check._id; //
      res.status(201).render("home", { naming: `${check.username}`, isLoggedIn: true });

      console.log(req.session.isLoggedIn);
      console.log(req.session.username);
      console.log(req.session.userId);

    } else if (!check) {
      res.render("login", { errorMessage: "User Does Not Exist" });
    } else {
      res.render("login", { errorMessage: "Incorrect password" });
    }
  } catch (error) {

    console.error(error);
    res.render("login", { errorMessage: "An error occurred. Please try again later."});
  }
});

app.post("/", async (req, res) => {
  try {
    console.log("isLoggedIn:", req.session.isLoggedIn);
    console.log("userId:", req.session.userId);
    console.log("username:", req.session.username);

    if (req.session.isLoggedIn) {

      const searchLocation = req.body.search;
      const userId = req.session.userId;
      const username = req.session.username;
      const existingSearchHistory = await SearchHistoryCollection.findOne({
        username: username,
        location: searchLocation,
      });

      if (existingSearchHistory) {
        console.log(`Search history for location "${searchLocation}" already exists for user ${username}`);
      } else {
        const searchHistoryData = {
          userId: userId,
          username: username,
          location: searchLocation,
        };
        console.log("Creating search history:", searchHistoryData);
        await SearchHistoryCollection.create(searchHistoryData);
        console.log("Search history created successfully");
      }
    } else {
      return;
    }
  } catch (error) {

    console.error(error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

app.post("/question", async (req, res) => {
  try {
    // Insert the new question into the database
    const question = req.body.question;
    const questionData = {
      userId: req.session.userId,
      username: req.session.username,
      question: question,
    };
    await QuestionsCollection.insertMany([questionData]);

    // Fetch the updated questions from the database
    const questions = await QuestionsCollection.find();

    // Render the forum page with the updated questions
    res.render("forum", { questions: questions });

  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

app.post("/comment", async (req, res) => {
  try {
    const questionId = req.session.questionId;
    const comment = req.body.comment;
    const commentData = {
      userId: req.session.userId,
      username: req.session.username,
      questionId: questionId,
      comment: comment,
    };
    console.log(commentData);
    await CommentsCollection.insertMany([commentData]);
    const comments = await CommentsCollection.find({ questionId: questionId });

    // Render the forum page with the updated questions
    res.render("selectedQuestion", { comments: comments });

  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

app.post("/signup", async (req, res) => {
  const signUpData = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  };

  try {
    const existingUserWithSameName = await LogInCollection.findOne({username: signUpData.username });
    const existingUserWithSameEmail = await LogInCollection.findOne({email: signUpData.email });

    if (existingUserWithSameName) {
      // If a user with the same username already exists
      res.status(409).render("signup", {errorMessage: "Username already taken"});

      // If a user with the same email already exists 
    } else if (existingUserWithSameEmail) {
      res.status(409).render("signup", {errorMessage: "E-Mail already taken" });

    } else {
      // If no user with the same data exists, create a new user in the database
      await LogInCollection.insertMany([signUpData]);

      const currentUser = await LogInCollection.findOne({ username: signUpData.username });
      req.session.isLoggedIn = true;
      req.session.username = currentUser.username;
      req.session.userId = currentUser._id;

      res.status(201).render("home", { naming: req.session.username, isLoggedIn: req.session.isLoggedIn });
    }
  } catch (err) {
    console.error(err);
    res.status(500).render("signup", {
      errorMessage:
        "An error occurred while processing your request. Please try again later.",
    });
  }
});

app.listen(port, () => {
  console.log(`port connected (${port})`);
});
