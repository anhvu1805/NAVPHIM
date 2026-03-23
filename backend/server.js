const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'movies.json');

app.get('/api/movies', (req, res) => {
    fs.readFile(DATA_PATH, 'utf8', (err, data) => {
        if (err) return res.json([]);
        res.json(JSON.parse(data || "[]"));
    });
});

app.post('/api/movies', (req, res) => {
    const newMovie = req.body;
    fs.readFile(DATA_PATH, 'utf8', (err, data) => {
        let movies = JSON.parse(data || "[]");
        newMovie.id = movies.length > 0 ? movies[movies.length - 1].id + 1 : 1;
        movies.push(newMovie);
        fs.writeFile(DATA_PATH, JSON.stringify(movies, null, 2), (err) => {
            if (err) return res.status(500).send("Error");
            res.status(201).json(newMovie);
        });
    });
});

app.delete('/api/movies/:id', (req, res) => {
    const id = parseInt(req.params.id);
    fs.readFile(DATA_PATH, 'utf8', (err, data) => {
        let movies = JSON.parse(data || "[]").filter(m => m.id !== id);
        fs.writeFile(DATA_PATH, JSON.stringify(movies, null, 2), () => {
            res.json({ success: true });
        });
    });
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));