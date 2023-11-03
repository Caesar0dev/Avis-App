const mongoose = require('mongoose')

const start_db = (mongoURL) => {
    // Connect to the MongoDB database
    mongoose.connect(mongoURL)
    .then(() => {
        console.log('Connected to MongoDB');
        // Start the server after connecting to MongoDB
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
    });

    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error: "));
    db.once("open", function () {
        console.log("Connected successfully");
    });
}

module.exports = {
    start_db
}