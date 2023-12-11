const mongoose = require('mongoose');

// Define the schema
const AvisSchema = new mongoose.Schema({
    Code: {
        type: String,
        required: true
    },
    CarName: {
        type: String,
        required: true
    },
    Type: {
        type: String,
        required: true
    },
    From: {
        type: String,
        required: true
    },
    To: {
        type: String,
        required: true
    },
    PayLater: {
        type: String,
        required: true
    },
    PayLaterTotal: {
        type: String,
        required: true
    },
    State: {
        type: String,
        required: true
    },
    City: {
        type: String,
        required: true
    },
    FullLocation: {
        type: String,
        required: true
    },
    URL: {
        type: String,
        required: true
    },
    //   timestamp: {
    //     type: Date,
    //     default: Date.now
    //   }
});

// Create the model from the schema
const Result = mongoose.model('AivsList', AvisSchema);

// Export the model
module.exports = Result;