const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Sample route
app.get('/', (req, res) => {
    res.send('Welcome to the Headless Raspberry Pi Project API');
});

// Additional routes can be defined here

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});