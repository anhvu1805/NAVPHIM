const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'movies.json');
const USERS_PATH = path.join(__dirname, 'users.json');

// Hàm bổ trợ để khởi tạo file JSON nếu chưa tồn tại
const initFiles = () => {
    if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, "[]");
    if (!fs.existsSync(USERS_PATH)) fs.writeFileSync(USERS_PATH, "[]");
};
initFiles();

// --- PHẦN QUẢN LÝ PHIM ---

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
            if (err) return res.status(500).send("Lỗi lưu phim");
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

// --- PHẦN TÀI KHOẢN & ĐĂNG NHẬP ---

app.post('/api/register', (req, res) => {
    const newUser = req.body;
    fs.readFile(USERS_PATH, 'utf8', (err, data) => {
        let users = JSON.parse(data || "[]");
        if (users.find(u => u.username === newUser.username)) {
            return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
        }
        // Khởi tạo lịch sử trống cho user mới
        newUser.history = []; 
        users.push(newUser);
        fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), (err) => {
            if (err) return res.status(500).json({ message: "Lỗi lưu file" });
            res.status(201).json({ message: "Đăng ký thành công" });
        });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    fs.readFile(USERS_PATH, 'utf8', (err, data) => {
        let users = JSON.parse(data || "[]");
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            res.json({ message: "Đăng nhập thành công", user: { username: user.username } });
        } else {
            res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
        }
    });
});

// --- PHẦN LỊCH SỬ HOẠT ĐỘNG ---

app.post('/api/history', (req, res) => {
    const { username, movieTitle } = req.body;
    fs.readFile(USERS_PATH, 'utf8', (err, data) => {
        let users = JSON.parse(data || "[]");
        let userIdx = users.findIndex(u => u.username === username);
        
        if (userIdx !== -1) {
            if (!users[userIdx].history) users[userIdx].history = [];
            // Lưu lịch sử: Phim mới nhất lên đầu, giữ tối đa 15 phim
            users[userIdx].history.unshift({ title: movieTitle, date: new Date().toLocaleString() });
            users[userIdx].history = users[userIdx].history.slice(0, 15);
            
            fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), () => {
                res.json({ success: true });
            });
        } else {
            res.status(404).json({ message: "Không tìm thấy user" });
        }
    });
});

app.get('/api/history/:username', (req, res) => {
    const username = req.params.username;
    fs.readFile(USERS_PATH, 'utf8', (err, data) => {
        let users = JSON.parse(data || "[]");
        const user = users.find(u => u.username === username);
        res.json(user?.history || []);
    });
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));