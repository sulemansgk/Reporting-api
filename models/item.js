const mongoose = require('mongoose'); // includes the mongoose library to handle the CRUD operations
const Schema = mongoose.Schema; //Describes the table Schema for CRUD Operations

const ApireportingSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = ApiRequest = mongoose.model('api_request', ApireportingSchema); // Creates a collection name api_request if its not present the defined database 