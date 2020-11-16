//jshint esversion:6

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/userDB", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("home");
});

app.route("/login")
    .get((req, res) => {
        res.render("login");
    })
    .post((req, res) => {
        const email = req.body.username;
        const password = req.body.password;

        User.findOne({ email: email }, (err, foundUser) => {
            if (err) {
                console.log(err);
            } else {
                if (foundUser) {
                    bcrypt.compare(
                        password,
                        foundUser.password,
                        (err, result) => {
                            if (err) {
                                console.log(err);
                            } else {
                                if (result === true) {
                                    res.render("secrets");
                                } else {
                                    res.redirect("/login");
                                }
                            }
                        }
                    );
                } else {
                    console.log("That user does not exist");
                    res.redirect("/login");
                }
            }
        });
    });

app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {
        const email = req.body.username;
        const password = req.body.password;

        bcrypt.hash(password, saltRounds, (err, hash) => {
            const newUser = new User({
                email: email,
                password: hash,
            });

            newUser.save((err) => {
                if (err) {
                    console.log(err);
                } else {
                    res.render("secrets");
                }
            });
        });
    });

app.listen(3000, () => {
    console.log("Listening on port 3000");
});
