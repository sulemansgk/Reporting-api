const mongoose = require('mongoose'); // includes the mongoose library to handle the CRUD operations
const Schema = mongoose.Schema; //Describes the table Schema for CRUD Operations

const LogsSchema = new Schema({
  type: {
    type: String,
    required: true
  },
  message: {
    type: String

  },
  gmailid: {
    type: String
  },
  toid: {
    type: String
  },
  subject: {
    type: String
  },
  sender: {
    type: String
  },
  recipent: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Logs = mongoose.model('logs', LogsSchema);  // Creates a collection name Logs if its not present the defined database 