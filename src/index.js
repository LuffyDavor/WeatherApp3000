const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const {LogInCollection} = require("./mongodb");
const {SearchHistoryCollection} = require("./mongodb");
const session = require('express-session');

const port = process.env.PORT || 420

app.use(express.json());
app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: false }));

const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

app.use(session({
    secret: '7590',
    resave: false,
    saveUninitialized: true,
  }));
  
  app.get("/logout", (req, res) => {
    req.session.isLoggedIn = false;
    req.session.userId = undefined; // Remove userId from session
    res.redirect("/");
  });

  
app.get("/",(req,res)=>{
    res.render("home")
})
app.get("/login",(req,res)=>{
    res.render("login")
})
app.get("/signup",(req,res)=>{
    res.render("signup")
})

app.post('/login', async (req, res) => {
  try {
    const check = await LogInCollection.findOne({ username: req.body.username })

    if (check && check.password === req.body.password) {
      req.session.isLoggedIn = true;
      req.session.username = check.username;
      req.session.userId = check._id; // Set the userId in the session
      
      res.status(201).render("home", { naming: `${check.username}`, isLoggedIn: true });
      console.log(req.session.isLoggedIn);
      console.log(req.session.username);
      console.log(req.session.userId);

    } else if(!check) {
      res.render('login', { errorMessage: 'User Does Not Exist' });
    } else {
      res.render('login', { errorMessage: 'Incorrect password' });
    }
  } catch (error) {
    console.error(error)
    res.render('login', { errorMessage: 'An error occurred. Please try again later.' });
  }
});
// app.post('/search', async (req, res) => {
//   const searchLocation = req.body.search; // Get search location from request body

//   // Save search history if user is logged in
//   if (req.session.isLoggedIn) {
//       const user = await LogInCollection.findById(req.session.userId);
//       console.log('isLoggedIn:', req.session.isLoggedIn);
//       console.log('userId:', req.session.userId);
//       console.log('username:', req.session.username);

//       const searchHistory = new SearchHistoryCollection({
//           userId: user._id,
//           username: user.username,
//           location: searchLocation
//       });

//       try {
//           await searchHistory.save();
//           console.log("Search history saved to database.");
//       } catch (error) {
//           console.error(error);
//       }
//   }

//   res.render("home", { isLoggedIn: req.session.isLoggedIn, naming: req.session.username });
// });

app.post('/', async (req, res) => {
  try {
    console.log('isLoggedIn:', req.session.isLoggedIn);
    console.log('userId:', req.session.userId);
    console.log('username:', req.session.username);
    
    if (req.session.isLoggedIn) {
      const searchLocation = req.body.search;
      const userId = req.session.userId;
      const username = req.session.username;
      const searchHistoryData = { userId: userId, username: username, location: searchLocation };
      console.log('Creating search history:', searchHistoryData);
      await SearchHistoryCollection.create(searchHistoryData);
      console.log('Search history created successfully');
    }else{
      return
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing your request.");
  }
  // res.render("home", { isLoggedIn: req.session.isLoggedIn, naming: req.session.username });
});




app.post('/signup', async (req, res) => {
    const signUpData = {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email
    }
  
    try {
      const existingUserWithSameName = await LogInCollection.findOne({ username: signUpData.username })
      const existingUserWithSameEmail = await LogInCollection.findOne({ email: signUpData.email })
  
      if (existingUserWithSameName) {
        // If a user with the same username already exists,
        // send an error message to the client
        res.status(409).render("signup", {
          errorMessage: "Username already taken"
        })
      } else if (existingUserWithSameEmail) {
        // If a user with the same email already exists,
        // send an error message to the client
        res.status(409).render("signup", {
          errorMessage: "E-Mail already taken"
        })
      } else {
        // If no user with the same data exists, create a new user in the database
        await LogInCollection.insertMany([signUpData])
        res.status(201).render("home", {
          naming: req.body.username
        })
      }
    } catch (err) {
      console.error(err)
      res.status(500).render("signup", {
        errorMessage: "An error occurred while processing your request. Please try again later."
      })
    }
})



app.listen(port,()=>{
    console.log(`port connected (${port})`);
})


