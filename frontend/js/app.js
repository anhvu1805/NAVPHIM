console.log = function() {};
console.warn = function() {};
console.error = function() {};

let allMovies = [];

function filterByYear(year) {
    const titleElem = document.getElementById('category-title');
    if (year === 'all') {
        if (titleElem) titleElem.innerText = "Phim Mới Cập Nhật";
        displayMovies(allMovies);
    } else {
        if (titleElem) titleElem.innerText = `Phim Năm ${year}`;
        const filtered = allMovies.filter(m => m.year == year);
        displayMovies(filtered);
    }
    if(document.getElementById('cinema-room')) closeCinema();
}

function searchMovies() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    const term = searchInput.value.toLowerCase();
    const filtered = allMovies.filter(m => 
        m.title.toLowerCase().includes(term) || 
        m.category.toLowerCase().includes(term)
    );
    const titleElem = document.getElementById('category-title');
    if (titleElem) titleElem.innerText = `Kết quả tìm kiếm: ${term}`;
    displayMovies(filtered);
}

function stopTrailer() {
    const displayArea = document.getElementById('display-area');
    if (displayArea) {
        displayArea.innerHTML = '';
    }
}

function updateUI(username) {
    const userSection = document.getElementById('user-section');
    if (!userSection) return;
    if (username) {
        userSection.innerHTML = `
            <div style="padding: 15px; background: #1a1a1a; border-radius: 8px; margin: 10px; border: 1px solid #333;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <div style="width: 35px; height: 35px; background: #e50914; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white;">
                        ${username.charAt(0).toUpperCase()}
                    </div>
                    <span style="margin-left: 12px; color: white; font-weight: 500;">${username}</span>
                </div>
                <button onclick="logout()" style="width: 100%; background: #333; border: none; color: #ff4d4d; padding: 8px; cursor: pointer; border-radius: 4px; font-size: 13px;">Đăng xuất</button>
            </div>`;
    } else {
        userSection.innerHTML = `
            <button onclick="openAuth()" style="color: #e50914; width: 100%; text-align: left; background:none; border:none; cursor:pointer; font-weight: bold; padding: 15px;">
                <i class="fas fa-user-circle"></i> Đăng nhập / Đăng ký
            </button>`;
    }
}

function openAuth() { 
    document.getElementById('authModal').style.display = 'flex'; 
    switchAuth('login'); 
}

function closeAuth() { 
    document.getElementById('authModal').style.display = 'none'; 
}

function logout() { 
    localStorage.removeItem('currentUser'); 
    location.reload(); 
}

function switchAuth(type) {
    const isLogin = type === 'login';
    document.getElementById('loginForm').style.display = isLogin ? 'block' : 'none';
    document.getElementById('registerForm').style.display = isLogin ? 'none' : 'block';
    document.getElementById('tabLogin').style.borderBottom = isLogin ? '2px solid #e50914' : 'none';
    document.getElementById('tabRegister').style.borderBottom = isLogin ? 'none' : '2px solid #e50914';
}

function getYoutubeId(url) {
    if (!url || typeof url !== 'string') return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function renderPlayer(url) {
    const cinemaRoom = document.getElementById('cinema-room');
    const area = document.getElementById('cinema-video-container');
    if (!cinemaRoom || !area) return;
    stopTrailer();
    closeModal();
    cinemaRoom.style.display = 'block';
    document.body.style.overflow = 'hidden';
    const videoId = getYoutubeId(url);
    if (videoId) {
        area.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    } else {
        area.innerHTML = `<video width="100%" height="100%" controls autoplay><source src="${url}" type="video/mp4"></video>`;
    }
}

async function loadMovies() {
    try {
        const response = await fetch('http://localhost:3000/api/movies');
        allMovies = await response.json();
        displayMovies(allMovies);
    } catch (e) {
        document.getElementById('movie-grid').innerHTML = '<p style="color:white;padding:20px;">Lỗi kết nối Server!</p>';
    }
}

function displayMovies(movies) {
    const grid = document.getElementById('movie-grid');
    if (!grid) return;
    grid.innerHTML = '';
    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.onclick = () => openModal(movie);
        card.innerHTML = `
            <div class="poster-box">
                <img src="${movie.poster}" alt="${movie.title}">
                <span class="quality">${movie.quality || 'HD'}</span>
            </div>
            <div class="movie-info"><h3>${movie.title}</h3><p>${movie.year} • ${movie.category}</p></div>`;
        grid.appendChild(card);
    });
}

function openModal(movie) {
    const modal = document.getElementById('movieModal');
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div id="display-area" style="width:100%; aspect-ratio:16/9; background:#000; display:flex; align-items:center; justify-content:center; cursor:pointer;" onclick="playTrailer('${movie.trailerUrl}')">
            <i class="fas fa-play-circle" style="font-size:60px; color:#fff; opacity:0.8; position:absolute; z-index:10;"></i>
            <img src="${movie.poster}" style="width:100%; height:100%; object-fit:cover; opacity:0.5;">
        </div>
        <div class="modal-info-detail" style="padding:25px;">
            <h1 style="color:white;">${movie.title}</h1>
            <p style="color:#46d369; font-weight:bold; margin:10px 0;">${movie.year} • ${movie.category}</p>
            <p style="color:#ccc; line-height:1.6;">${movie.description || 'Nội dung đang cập nhật...'}</p>
            <button class="play-btn" id="btn-watch-now" style="margin-top:20px;">XEM PHIM NGAY</button>
        </div>`;
    modal.style.display = 'flex';
    document.getElementById('btn-watch-now').onclick = () => {
        if (!localStorage.getItem('currentUser')) {
            alert("Vui lòng đăng nhập!");
            openAuth();
        } else {
            renderPlayer(movie.movieUrl);
        }
    };
}

function playTrailer(url) {
    const videoId = getYoutubeId(url);
    if (videoId) {
        document.getElementById('display-area').innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allowfullscreen></iframe>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.sidebar nav button');
    if (navButtons.length >= 4) {
        navButtons[0].onclick = () => filterByYear('all');
        navButtons[1].onclick = () => filterByYear(2024);
        navButtons[2].onclick = () => filterByYear(2025);
        navButtons[3].onclick = () => filterByYear(2026);
    }
    const searchBtn = document.querySelector('.search-container button');
    if (searchBtn) searchBtn.onclick = searchMovies;
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchMovies();
        });
    }
    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('loginUser').value;
        const pass = document.getElementById('loginPass').value;
        const res = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: user, password: pass})
        });
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('currentUser', data.user.username);
            updateUI(data.user.username);
            closeAuth();
        } else alert("Sai tài khoản hoặc mật khẩu!");
    });
    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const res = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: document.getElementById('regUser').value,
                email: document.getElementById('regEmail').value,
                password: document.getElementById('regPass').value
            })
        });
        if (res.ok) { alert("Đăng ký thành công!"); switchAuth('login'); }
        else alert("Lỗi đăng ký!");
    });
    document.addEventListener('contextmenu', ev => ev.preventDefault());
    document.onkeydown = e => {
        if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 85)) return false;
    };
    loadMovies();
    updateUI(localStorage.getItem('currentUser'));
});

function closeModal() { 
    stopTrailer();
    document.getElementById('movieModal').style.display = 'none'; 
}

function closeCinema() { 
    document.getElementById('cinema-video-container').innerHTML = ''; 
    document.getElementById('cinema-room').style.display = 'none'; 
    document.body.style.overflow = 'auto'; 
}