if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

// npm library
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const LocalStrategy = require('passport-local').Strategy;
const passport = require("passport");
const User = require("./models/users");
const initializePassport = require("./passport-config");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const app = express();

//const users = require("./models/users");

// هنا فيه مشكلة
/*
initializePassport(
    passport,
    email => users.findOne( {email: req.params.email}),
    id => users.findOne( {_id: req.params.id})
    )

// الى هنا 
*/
// set templatinh engine as ejs
app.set("view engine", "ejs");

// serving static files
app.use(express.static("public"));


// body parser middlewere

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))






// parse application/json
app.use(bodyParser.json())

// database url
const url = "mongodb+srv://sara:12345@cluster0.trh4phx.mongodb.net/?retryWrites=true&w=majority";

//connecting application with DB
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(console.log("MongoDB Connected")).catch(err => console.log(err));
/*
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  */
  initializePassport(passport, User );

  
//session 
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // We wont resave the session variable if nothing is changed
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// login post 
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/appointment_page',
    failureRedirect: '/login',
  }));


/*
app.post("/login", passport.authenticate("local", {
    successRedirect: "/logedin",
    failureRedirect: "/login",
    failureFlash: true
}))


*/
// route for retriving loged in data

/*
شغال لكن بدون سشن
app.post("/login", async function (req, res) {
    try {
        const check= await users.findOne({email: req.body.email})
        if(check.email){
            console.log(check.password);
            if(await bcrypt.compare(req.body.password, check.password)){
                res.send("true password");
            }
            else{
                res.send("wrong password");
            }
        }
        else{
            res.send("not email")
        }
        
      
    }
    catch (e) {
        console.log(e);
        res.redirect("/login")
    }
});
*/

// route for saving user data (regestration data)


app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
      const { name, email, password, major, experience, facebook, twitter, linkedin } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name: name, email: email, password: hashedPassword, major: major, experience: experience, facebook: facebook, twitter:twitter, linkedin: linkedin});
      await user.save();
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.redirect('/logedin');
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  app.post('/appointment_request/:id', checkNotAuthenticated, async (req, res) => {
    try {
      const { pname, pemail, time } = req.body;
      const id= req.params.id;
      var appointment={pname: pname , pemail: pemail, time: time};
      const appoi= User.findByIdAndUpdate(
        id,
        { $push: { appointment: appointment } },
        
         ).exec();

         //await appoi.save();
         
         res.redirect("/");

     
      
    
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  
/*
app.post("/register", async function (req, res) {
    try {
        // console.log(req.body.password);
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        //console.log(hashedPassword);

        //save the data to DB
        const data = new users({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });

        data.save().then(() => {
            res.redirect("/login")
        }).catch(err => console.log(err)); // باقي هنا لو كان فيه ايميل مسجل يرسل تحذير

    }
    catch (e) {
        console.log(e);
        res.redirect("/register")
    }
});
*/
// routes
//main page route
app.get("/", checkNotAuthenticated, function (req, res) {
    res.render("index.ejs",);
});

app.get("/register", checkNotAuthenticated, function (req, res) {
    res.render("register.ejs");
});

app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("login.ejs");
});

app.get("/specialist", checkNotAuthenticated, (req, res) => {
    User.find().then(data => {
        res.render("specialist.ejs", {data: data});
        console.log(data)
    }).catch(err => console.log(err));

});

app.get("/appointment_page", checkAuthenticated,  (req, res) => {
    res.render("appointment_page.ejs", {user: req.user});
});
app.get("/appointment_request/:id", checkNotAuthenticated, (req, res) => {
    res.render("appointment_request.ejs", {id: req.params.id});
});

// logout
app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/")
    })
})

/*
// route for displaying records
app.get("/user/:id", function (req, res) {
    User.findOne({
        _id: req.params.id
    }).then(data => {
        res.render("page", { data: data });
    }).catch(err => console.log(err));
});


// تجريبي
app.get("/logedin", function (req, res) {
    User.find().then(data => {
        res.render("logedin.ejs", { data: data });
        console.log(data)
    }).catch(err => console.log(err));

});
*/


// end routes

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    next()
}

//create server
app.listen(3000, () => { console.log("server is waiting"); });