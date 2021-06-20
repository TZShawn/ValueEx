const express = require('express');
const app = express();
const morgan = require('morgan');
const {prohairesis} = require('prohairesis');
const bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./profiles.db');
const upload = require('express-fileupload');
const { response } = require('express');
const { fstat } = require('fs');
const fs = require('fs');

const port = process.env.PORT || 8000;

let username = ""

app
    .use(express.static('public'))
    .use(morgan('dev'))
    
    .use(bodyParser.urlencoded({extended: false}))
    .use(bodyParser.json())

    .listen(port, () => console.log('listening on port' + port));
/////////////////////////////////////////////////////////////////////////////

//LOGOUT
app.post('/logou', async(req, res) => {
    try{
        console.log('NICE')
        username=""
    }
    catch{console.log("err")}
})


//CHECK IF USERNAME IS ACTIVE
app.get('/checkuser', async(req, res) => {
    try{
        var user = {usname: username}
        res.json(user);
    }catch{
        console.log("err")
    }
})


//LISTENER FOR CREATING A NEW ACCOUNT
app.post('/register', async (req ,res) => {
    try{
        createProfile(req.body.user, req.body.pass, req.body.email, req.body.phone);
        res.redirect('./login.html')
    }
    catch{
        console.log('err')
    }
})

//CHECKS IF THE LOGIN INFORMATION IS CORRECT
app.post('/login', (req, res) => {
    try{
        console.log(req.body.user);
        db.each('SELECT rowid AS name, password FROM profiles WHERE name="' + req.body.user + '"', function(err, row) {
            if(err){
                console.log(err)
            }
            else{
                username = req.body.user;
                if(row.password === req.body.pass){
                    res.redirect('./Account.html')
                }else{
                    console.log("WRONG SHIT")
                    res.redirect('./login.html')
                }
            }
        });
        console.log(sysId);
    }
    catch{
        console.log('err')
    }
})

//MAKES A LISTING FOR THE THING
app.use(upload());

app.post('/makelist', (req ,res) => {
    if(req.files){
        var file = req.files.file;
        var filename = file.name;
        console.log(filename);
        
        try{
            createListing(filename, req.body.price, req.body.number, req.body.name, req.body.location, req.body.pname, req.body.type);
        }catch{
            console.log('err')
        }

        file.mv('./public/uploads/'+filename, function(err){
            if(err){
                res.send(err);
            }else{
                res.redirect('./Account.html')
            }
        })
    }
})

//GENERATE ALL LISTINGS FROM DATABASE
app.use(express.json());

let selection = ""

app.post('/getlist', (req, res) => {
    selection = req.body.filvalue
})

app.get('/getlist', (req, res) => {
    console.log("action started")
    console.log(selection)

    if(selection !== "other"){
        db.all(`SELECT * FROM listings WHERE type="${selection}"`, (err, row) => {
            res.json(row);
        })
    }
    else{
        db.all('SELECT * FROM listings', (err, row) => {
            res.json(row);
        })
    }
})

app.get('/getmylist', (req, res) => {
    console.log("action started")
        db.all('SELECT * FROM listings WHERE username="'+username+'"', (err, row) => {
            res.json(row);
        })
})


//DELETE LISTING
app.post('/deletelisting', (req, res) => {
    console.log(req.body.imageID);
    db.run('DELETE FROM listings WHERE image="'+req.body.imageID+'"')
    fs.unlink(`./public/uploads/${req.body.imageID}`, (err) => {
        if(err) throw err; 
        console.log("FILE DELETED")
    })
    console.log("DELETED")
    res.redirect('./Account.html')
})
///////////////////////////////////////FUNCTIONS/////////////////////////////////////////
function createListing(k, i, j, l,n, m, s){
    db.run('INSERT INTO listings (image, price, number, user, name, completed, location, type, username)VALUES("'+k+'","'+i+'","'+j+'","'+m+'","'+l+'","no","'+n+'","'+s+'","'+username+'")', 
                                function(err, row) {
        if(err){
            console.log(err)
        }
        else{
            console.log("UPLOADED TO DB")
        }
    });
}


function createProfile(k, i, j, l){
    db.run('INSERT INTO profiles (name, password, email, number)VALUES ("' + k + '", "' + i + '", "' + j + '", "' + l + '")', function(err, row) {
        if(err){
            console.log(err)
        }
        else{
            console.log("UPLOADED TO DB")
        }
    });
}
