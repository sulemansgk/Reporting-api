// Required library to perform tasks 
const Nexmo = require('nexmo');
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
var googleTTs = require('google-tts-api');
var request = require('request');
var download = require('download-file');
var rn = require('random-number');
var mydate = require('current-date');
const path = require('path');
const app = express();
var mongoose = require('mongoose');
const Item = require('./models/Item');
const logs = require('./models/logs');
const items = require('./routes/api/item');

app.use(bodyParser.json());


mongoose.connect(''); //provide your Mongo db connection here !!
console.log('MongoDB Connected Successfully...');

// Use Routes
app.use('/AddApiTokenOrType', items);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
    //Set static folder
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const port = process.env.PORT || 5000; //This defines the port to be used for the application
app.listen(port, () => console.log(`Server Started on Port ${port}`)); // when we start our api, it will output the port where this application is listening 

const nexmo = new Nexmo({
    apiKey: 'ce9f6823',
    apiSecret: 'R5uHre2S6y1iguGO'
}); //for this api to send sms, we used nexmo. if you have different gateway please configure your constants accordingly 


app.post('/reporting-api', (req, res) => { // this is how we can access our api e.g. http://localhost:5000/reporting-api

    //According to the documentation, the api requires valid token and id to perform further tasks.
    const Reqtoken = req.body.token;
    const ReqType = req.body.type;


    //this will take the token and id and cross check it into the database to check its validity. 
    //For this api we created a table called item to store valide token and id
    Item.findOne({
        token: Reqtoken,
        type: ReqType
    }, function(err, obj) {
        if (!obj) {
            res.status(404).json({
                success: false
            });
            //if the token and id is not found the api will return 404 error as a result and returns with a false
            return;
        }
        //but if the token is valid it will assign it to variables 
        const TOKEN = obj.token;
        const TYPE = obj.type;
        if (Reqtoken == TOKEN && ReqType == TYPE) {
            var RequestType = req.body.type;
            if (RequestType == 'sms') {//if the request for sms is sent then the following function will fire 

                if (Sms(req.body)) { // if the sms is sent then it inserts data in the logs for sms

                    const logs = new Logs({
                        type: req.body.type,
                        message: req.body.message,
                        sender: req.body.sender,
                        recipent: req.body.recipent
                    });

                    logs.save().then(logs => res.json(logs)); // after saving the logs it prints what it saved in the collection


                } else {
                    //if sms is not sent, it will generate  false
                    res.status(404).json({
                        success: false
                    });
                    return; 
                }



            } else if (RequestType == 'email') { //if the request for email is sent then the following function will fire 

                if (Email(req.body)) { // if the email is sent then logs for email is stored in logs collection
                    const logs = new Logs({
                        type: req.body.type,
                        gmailid: req.body.gmailid,
                        toid: req.body.toid,
                        subject: req.body.subject,
                        message: req.body.message
                    });

                    logs.save().then(logs => res.json(logs)); // this will return the saved data 
                } else {
                    //if email is not sent, it will generate  false
                    res.status(404).json({
                        success: false
                    });
                    return;
                }



            } else if (RequestType == 'call') {//if the request for call is sent then the following function will fire 

                if (Call(req.body)) { // if the call is sent then logs for call is stored in logs collection

                    // insert data logs
                    const logs = new Logs({
                        type: req.body.type,
                        message: req.body.message
                    });

                    logs.save().then(logs => res.json(logs));

                } else {
                    //if call is not sent, it will generate  false
                    res.status(404).json({
                        success: false
                    });
                    return;
                }



            } else {
                console.log('Error');
            }
        } else {
            console.log('TOKEN OR ID INVALID');
        }

    });
});


// Send Email function uses nodemailer, if you want to change to different gateway configure it here
function Email(req) {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: req.gmailid,
            pass: req.pass
        }
    });

    var mailOptions = {
        from: req.gmailid,
        to: req.toid,
        subject: req.subject,
        text: req.message
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
            return false;

        } else {
            console.log('Email sent: ' + info.response);
            return true;
        }
    });

}
// End Email


function Call(req) { //according to the documentation the function requires arugments that is nessary for example the req.message is nessary so that google tts can work
   // Date parse to speech
    googleTTs(req.message, 'en', 1).then(function(url) {

        var options = {
            directory: "./call_files",
            filename: mydate('date') + '.' + rn() + '.mp3'
        }

        download(url, options, function(err) {
            if (err) {
                return false;
            } else {
                console.log("Successfully Download File");
                return true;
            }

        });

    });
//call gateway to be implemented here!!

}

function Sms(req) {
    // Send SMS, this function takes three argument //req.sender that is senders mobile details, req.recipent = recipient number and req.messge = the message you want to send
    nexmo.message.sendSms(req.sender, req.recipent, req.message,
        (err, responseData) => {
            if (err) {
                console.log(err); // prints the error then returns false
                return false;
            } else {
                console.dir(responseData); //  // prints the details then returns true
                return true;
            }
        });
    // End Sms
}