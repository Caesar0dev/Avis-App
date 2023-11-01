const express = require('express');
const bodyParser = require('body-parser');
const app = express();

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
    const givenDate = req.body.data;
    console.log("submitted data in backend: ",givenDate);

    // Do something with the submitted data (e.g., save it to a database)
    // ...

    // Send a response back to the frontend
    
    // res.render('index', { message: 'Hello, World!' });
    res.send('Data submitted successfully'+givenDate);
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

