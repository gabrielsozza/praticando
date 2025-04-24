const API = 'http://localhost:3000';
const token = localStorage.getItem('token');
const storedUsername = localStorage.getItem('username');

if(!token) location.href = 'index.html';

document.getElementById('username').innerText = storedUsername || '';

async function loadHome(){
    const res = await fetch(`${API}/home`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if(res.status === 401) return location.href = 'index.html';
    const { username, schedules } = await res.json();


    document.getElementById('username').innerText = username;

    
    const ul = document.getElementById('scheduleList');
    schedules.forEach( s => {
        const li = document.createElement('li');
        li.innerText = s.name;
        ul.appendChild(li);
    });
}
loadHome();

//DROPDOWN USER
document.getElementById('btnToggle').onclick = () => {
    document.getElementById('dropdown').classList.toggle('hidden');
};
document.getElementById('btnLogout').onclick = () => {
    localStorage.clear();
    location.href = 'index.html'
};
window.onpopstate = () => {
    if(!localStorage.getItem('token')) {
        alert('Faça login para continuar');
        location.href = 'index.html';
    }
};