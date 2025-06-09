const API = 'http://localhost:3000';
const token = localStorage.getItem('token');
const title = document.getElementById('title');
const btnBack = document.getElementById('btnBack');

// Pega o ID do cronograma da URL
const urlParams = new URLSearchParams(window.location.search);
const scheduleId = urlParams.get('id');

// Verifica login
if (!token) location.href = 'index.html';

// Carrega os dados do cronograma
async function loadSchedule() {
    const res = await fetch(`${API}/schedules/${scheduleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        alert('Erro ao carregar cronograma');
        location.href = 'home.html';
        return;
    }
    const data = await res.json();
    title.innerText = `Cronograma: ${data.name}`;
}

loadSchedule();

btnBack.onclick = () => {
    history.back(); // Ou: location.href = 'home.html';
};
