const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const puppeteer = require('puppeteer');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const mongoURL = 'mongodb://localhost:27017/Avis'; // Replace with your MongoDB connection string and database name
const fs = require('fs');
const Result = require('./schema'); // Import the schema from the file
// const { receiveMessageOnPort } = require('worker_threads');
const scrapFunction = require("./scrape").scrapFunction;
const percentFunction = require("./scrape").percentFunction;
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
// const Json2csvParser = require("json2csv").Parser;
// const ExcelJS = require('exceljs');

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
app.use(express.static('Result'));
// app.use(express.static(path.join(__dirname, 'public')));
// Set the view engine to EJS
app.set('view engine', 'ejs');

// Define a route for the homepage
app.get('/', (req, res) => {
    // Render the 'index' template and pass a variable called 'message'
    res.render('index', { message: 'scraping now ...' });
});

app.get('/getpercentage', (req, res) => {
    let percentageCount = percentFunction().percentage;
    // console.log("res --->>> ", percentFunction());
    let scrapeStartDate = percentFunction().scrapeStartDate;
    // percentage = (Number(percentage)/63180*100).toFixed(0);
    // percentage = percentage.toString();

    res.send({percentageCount, scrapeStartDate});
});

// Set up Express route handler for download
app.get('/download', (req, res) => {
    const filename = req.body;
    const filePath = path.join(__dirname, 'Result', filename);
    res.download(filePath);
});

// Handle form submission
app.post('/submit', (req, res) => {
    async function ReceiveSubmit() {
        const givenDate = req.body.data;
        // console.log("submitted data in backend: ",givenDate);
    
        const scrapResult = await scrapFunction(givenDate);
        // console.log("scraped results >>> ", scrapResult);
    
        // Send a response back to the frontend
        res.send(scrapResult);

    }

    ReceiveSubmit();
    
    // res.render('index', { message: 'Hello, World!' });
});


// Route to handle file deletion
app.post('/delete-file', (req, res) => {
    // console.log("delete file name >>> ", req.body)
    const fileName = req.body.deletefileName; // The name of the file to delete
    const filePath = path.join(__dirname, 'Result', fileName); // Set the full file path
  
    // Delete the file using fs.unlink
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        // If an error occurs (e.g., file not found), redirect or render an error page
        return res.status(404).render('error', { message: 'File not found' });
      }
  
      // Redirect to the home page or render a success page
      res.redirect('/'); // Or res.render('success');
    });
  });

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

