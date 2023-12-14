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

//Mongoose Connection
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/userDB');
    //New schema and model
    const userSchema = new mongoose.Schema({
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        }
    });
    const User = mongoose.model('User', userSchema);

    //Home Route
    app.get('/', (req, res) => {
        res.render('home');
    });

    //Register Route
    app.route('/register')
        .get((req, res) => {
            res.render('register');
        })
        .post((req, res) => {
            const newUser = new User({
                email: req.body.username,
                password: req.body.password
            });
            newUser.save();
            res.render("secrets");
        });

    //Login Route
    app.route('/login')
        .get((req, res) => {
            res.render('login');
        })
        .post((req, res) => {
            const username = req.body.username;
            const password = req.body.password;

            User.findOne({email: username}).then(foundUser => {
                if (foundUser.password != password) {
                    res.send("Wrong Credentials");
                } else {
                    res.render("secrets");
                }
            });
        });

    //Port check
    app.listen(4040, () => {
        console.log('Listening on port 4040');
    });
}