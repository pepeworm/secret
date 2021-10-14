//jshint esversion:6

//variables
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
    session({
        secret: "TokenS3creT2005", //This is a secret
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// * Home Route

app.get("/", (req, res) => {
    res.render("home");
});

// * Login Route

app.route("/login")
    .get((req, res) => {
        res.render("login");
    })
    .post((req, res) => {
        const user = new User({
            username: req.body.username,
            password: req.body.password,
        });

        req.login(user, (err) => {
            if (err) {
                console.log(err);
                res.redirect("/login");
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secrets");
                });
            }
        });
    });

// * Register Route

app.route("/register")
    consoe.log("Registered new user successfully");
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {
        const email = req.body.username;
        const password = req.body.password;

        User.register({ username: email }, password, (err, user) => {
            if (err) {
                console.log(err);
                res.redirect("/register");
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secrets");
                });

                if (req.statusCode === 401) {
                    console.log("Error code: 401");
                    res.redirect("/register");
                }
            }
        });
    });

// * Logout Route

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
    console.log("Logged out successfully!");
});

// * Secrets Route

app.route("/secrets").get((req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.listen(3000, () => {
    console.log("I am now listening on port 3000 for incoming traffic");
});
