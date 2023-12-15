require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose')

const app = express();

//App Set and Use
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "our secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//Mongoose Connection
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/userDB');
    //New schema and model
    const userSchema = new mongoose.Schema({
        email: String,
        password: String
    });

    userSchema.plugin(passportLocalMongoose);

    const User = mongoose.model('User', userSchema);

    passport.use(User.createStrategy());

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    //Home Route
    app.get('/', (req, res) => {
        res.render('home');
    });

    //Secret Route
    app.get('/secrets', (req, res) => {
        if (req.isAuthenticated()) {
            res.render("secrets");
        } else {
            res.redirect("/login");
        }
    });

    //Register Route
    app.route('/register')
        .get((req, res) => {
            res.render('register');
        })
        .post((req, res) => {
            User.register(
                { username: req.body.username },
                req.body.password,
                (err, user) => {
                    if (err) {
                        console.log(err);
                        res.redirect("/register");
                    } else {
                        passport.authenticate("local")(req, res, () => {
                            res.redirect("/secrets");
                        });
                    }
                });
        });

    //Login Route 
    app.route('/login')
        .get((req, res) => {
            res.render('login');
        })
        .post((req, res) => {
           const user = new User ({
            username: req.body.username,
            password: req.body.password
           });

           req.login(user, (err)=> {
            if (err) {
                console.log(err);
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secrets");
                });
            }
           });
        });

        //LogOut Route
        app.get('/logout', (req,res) => {
            req.logOut((err) => {
                if (err) {
                    return next(err);
                }
            });
            res.redirect('/');
        });
    //Port check
    app.listen(3000, () => {
        console.log('Listening on port 3000');
    });
}