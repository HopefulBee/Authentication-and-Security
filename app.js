require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

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

    //App Routes
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
            bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
                //Create new user
                const newUser = new User({
                    email: req.body.username,
                    password: hash
                });
                newUser.save()
                    .then(res.render('secrets'))
                    .catch(err => {
                        console.log(err);
                    });
            });
        });

    //Login Route
    app.route('/login')
        .get((req, res) => {
            res.render('login');
        })
        .post((req, res) => {
            const username = req.body.username;
            const password = req.body.password;
            User.findOne({ email: username }).then(foundUser => {
                if (foundUser) {
                    bcrypt.compare(password, foundUser.password, function (err, result) {
                        // result == true
                        if (result === true) {
                            res.render('secrets');
                        }
                    });
                    bcrypt.compare(password, foundUser.password, function (err, result) {
                        // result == false
                        if (result === false) {
                            res.send('Wrong Credentials');
                        }
                    });
                }
            })//endOfTHEN

                .catch((err) => {
                    console.log(err);
                });
        });

    //Port check
    app.listen(4040, () => {
        console.log('Listening on port 4040');
    });

}