const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const puppeteer = require('puppeteer');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const mongoURL = 'mongodb://localhost:27017/Avis'; // Replace with your MongoDB connection string and database name
const fs = require('fs');
const Result = require('./schema'); // Import the schema from the file
const { receiveMessageOnPort } = require('worker_threads');
const scrapFunction = require("./scrape").scrapFunction;

// const scrapResults = null;

// Connect to the MongoDB database
mongoose
    .connect(mongoURL, {
        // useNewUrlParser: true,
        // useCreateIndex: true,
        // useFindAndModify: false,
        // useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error(error.message);
        // Exit process with failure
        process.exit(1);
    });


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
// Set the view engine to EJS
app.set('view engine', 'ejs');

// Define a route for the homepage
app.get('/', (req, res) => {
    // Render the 'index' template and pass a variable called 'message'
    res.render('index', { message: 'scraping now ...' });
});
// Handle form submission
app.post('/submit', (req, res) => {
    async function ReceiveSubmit() {
        const givenDate = req.body.data;
        console.log("submitted data in backend: ",givenDate);
    
        const scrapResults = await scrapFunction(givenDate);
        console.log("scraped results >>> ", scrapResults);
        
        for (let i = 0; i < scrapResults.length; i++) {
            const scrapResult = scrapResults[i];
            const result = new Result(scrapResult);
        
            result.save()
                .then (() => {
                    console.log("data saved successfully!");
                })
                .catch (() => {
                    console.log("save error!");
                })
        }
    
        // Send a response back to the frontend
        res.send('Scraping is completed successfully for '+givenDate);

    }

    ReceiveSubmit();
    
    // res.render('index', { message: 'Hello, World!' });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

