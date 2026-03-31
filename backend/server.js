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
const express = require("express");
const fs = require("fs");
const path = require("path");
const compression = require("compression");
const cors = require("cors");


app.use(cors());
app.use(compression());

// API stream video
app.get("/video", (req, res) => {
    const videoPath = path.join(__dirname, "videos/sample.mp4");
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunkSize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });

        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "video/mp4",
        });

        file.pipe(res);
    } else {
        res.writeHead(200, {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4",
        });
        fs.createReadStream(videoPath).pipe(res);
    }
});

app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
app.listen(3000, () => console.log('Server running at http://localhost:3000'));