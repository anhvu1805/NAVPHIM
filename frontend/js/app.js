console.log = function() {};
console.warn = function() {};
console.error = function() {};
let allMovies = [];
async function loadMovies() {
    try {
        const response = await fetch('http://localhost:3000/api/movies');
        allMovies = await response.json();
        document.getElementById('category-title').innerText = "Phim Mới Cập Nhật";
        displayMovies(allMovies);
    } catch (error) {
        document.getElementById('movie-grid').innerHTML = '<p>Lỗi kết nối server!</p>';
    }
}

function displayMovies(movies) {
    const movieGrid = document.getElementById('movie-grid');
    movieGrid.innerHTML = '';
    
    if (movies.length === 0) {
        movieGrid.innerHTML = '<p>Không tìm thấy phim phù hợp.</p>';
        return;
    }

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.onclick = () => openModal(movie); 

        movieCard.innerHTML = `
            <div class="poster-box">
                <img src="${movie.poster}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/300x450?text=NAVPHIM'">
                <span class="quality">${movie.quality || 'HD'}</span>
            </div>
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>${movie.year} • ${movie.category}</p>
            </div>
        `;
        movieGrid.appendChild(movieCard);
    });
}

function searchMovies() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allMovies.filter(m => 
        m.title.toLowerCase().includes(term) || 
        m.category.toLowerCase().includes(term)
    );
    displayMovies(filtered);
}

function filterByYear(year) {
    document.getElementById('category-title').innerText = `Phim Năm ${year}`;
    displayMovies(allMovies.filter(m => m.year === year));
}

function openModal(movie) {
    const modal = document.getElementById('movieModal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <div class="modal-video">
            <iframe width="100%" height="400" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        </div>
        <div class="modal-info" style="padding: 25px; background: #181818; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h1 style="margin: 0; font-size: 24px;">${movie.title}</h1>
                <span style="background: #e50914; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${movie.quality}</span>
            </div>
            <p style="margin: 10px 0; color: #46d369;">${movie.year} • ${movie.category}</p>
            <p style="color: #ccc; line-height: 1.5;">${movie.description}</p>
            <div style="margin-top: 20px;">
                <button style="background: white; color: black; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer;">XEM NGAY</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('movieModal').style.display = 'none';
    document.getElementById('modal-body').innerHTML = '';
    document.addEventListener('contextmenu', event => event.preventDefault());
    }
    document.addEventListener('contextmenu', event => event.preventDefault());

document.onkeydown = function (e) {
    if (e.keyCode == 123) { 
        return false;
    }
    if (e.ctrlKey && e.shiftKey && (e.keyCode == 'I'.charCodeAt(0) || e.keyCode == 'J'.charCodeAt(0))) {
        return false;
    }
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        return false;
    }
};
window.onload = loadMovies;