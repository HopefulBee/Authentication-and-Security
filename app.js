require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const md5 = require('md5');


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
        email:{
            type: String,
            required: true
        },
        password:{
            type: String,
            required: true
        }
    });
    const User = mongoose.model('User', userSchema);

    //App Routes
    app.get('/', (req, res) => {
        res.render('home');
    });

    app.get('/login', (req, res) => {
        res.render('login');
    });

    app.get('/register', (req, res) => {
        res.render('register');
    });

    //Register to view the secrets page
    app.post('/register',  (req,res) => {
        //Create new user
        const newUser = new User({
            email: req.body.username,
            password: md5(req.body.password)
        });
         newUser.save()
            .then(res.render('secrets'))
            .catch(err => {
                console.log(err);
            })   
    });

    //Check log in credentials and open secrets page
    app.post('/login',  (req,res) => {
        const username = req.body.username;
        const password = req.body.password;
         User.findOne({email: username})
            .then(foundUser => {
               if (foundUser) {
                if (foundUser.password === password) {
                    res.render('secrets');
                }else{
                    res.send('wrong credentials');
                }
               }
            })
            .catch((err) => {
                console.log(err);
            });
    });

    //Port check
    app.listen(4040, () => {
        console.log('Listening on port 4040');
    });

}