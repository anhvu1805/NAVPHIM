const express = require('express');
const cors = require('cors');
const app = express();
const movies = require('./movies.json');

app.use(cors());

app.get('/api/movies', (req, res) => {
    res.json(movies);
});

app.listen(3000, () => {
    console.log('Server NAVPHIM đang chạy tại http://localhost:3000');
});