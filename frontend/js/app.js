const API_URL = 'http://localhost:3000/api/movies';

async function loadMovies() {
    try {
        const response = await fetch(API_URL);
        const movies = await response.json();
        renderMovies(movies);
    } catch (error) {
        console.error("Lỗi:", error);
        document.getElementById('movie-grid').innerHTML = "Lỗi kết nối Backend!";
    }
}

function renderMovies(movies) {
    const grid = document.getElementById('movie-grid');
    grid.innerHTML = movies.map(movie => `
        <div class="movie-card">
            <div style="height:280px; background:#333; border-radius:5px;"></div>
            <div class="movie-info">
                <span class="badge">${movie.quality}</span>
                <h3>${movie.title}</h3>
                <p>Năm: ${movie.year} | ${movie.category}</p>
            </div>
        </div>
    `).join('');
}

async function filterMovies(year) {
    const response = await fetch(API_URL);
    const movies = await response.json();
    const filtered = year === 'all' ? movies : movies.filter(m => m.year === year);
    renderMovies(filtered);
}

loadMovies();
async function searchMovies() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const response = await fetch(API_URL);
    const movies = await response.json();
    
    const filtered = movies.filter(m => 
        m.title.toLowerCase().includes(query) || 
        m.category.toLowerCase().includes(query)
    );
    renderMovies(filtered);
}