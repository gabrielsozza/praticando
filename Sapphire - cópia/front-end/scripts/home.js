const API = 'http://localhost:3000';
const token = localStorage.getItem('token');
const storedUsername = localStorage.getItem('username');

//Se não estiver logado, redireciona
if (!token) location.href = 'index.html';

//Exibe o nome do usuário armazenado
document.getElementById('username').innerText = storedUsername || '';


const btnNew = document.getElementById('btnNew');
const cardsContainer = document.getElementById('cardsContainer');
const welcomeText = document.getElementById('welcomeText');
const main = document.querySelector('.main');

//Carrega dados iniciais
async function loadHome() {
    const res = await fetch(`${API}/home`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.status === 401) return location.href = 'index.html';
    const { username, schedules } = await res.json();
    welcomeText.innerText = `Bem-vindo, ${username}!`;
    renderCards(schedules);
}

//Redeniza os Cards de Cronograma
function renderCards(schedules) {
    cardsContainer.innerHTML = '';
    schedules.forEach(s => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerText = s.name;
        div.onclick = () => {
            location.href = `schedule.html?id=${s.id}`;
        };
        cardsContainer.appendChild(div);
    });
}

loadHome();

//MODAL DE NOVO CRONOGRAMA
btnNew.onclick = () => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    //CRIAR MODAL
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
    <h3>Novo Cronograma</h3>
    <input id="newName" type="text" placeholder="Nome do cronograma">
    <button id="createBtn">Criar</button>
    `;
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    //CRIAR CRONOGRAMA AO CLICAR NO BOTÃO
    document.getElementById('createBtn').onclick = async () => {
        const name = document.getElementById('newName').value.trim();
        if (!name) return alert('Digite um nome');

        //CHAMA API
        const res = await fetch(`${API}/schedules`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });
        const data = await res.json();
        if (res.ok) {
            //Adiciona novo card
            renderCards([...document.querySelectorAll('.card')].map(c => ({ name: c.innerText })));
            //Recarrega todos
            loadHome();
            document.body.removeChild(backdrop);
        } else {
            alert(data.error);
        }
    };

    //Fechar ao clicar fora
    backdrop.onclick = e => {
        if (e.target === backdrop) document.body.removeChild(backdrop);
    };
};

//Dropdown e logout mantidos...
document.getElementById('btnToggle').onclick = () => {
    document.getElementById('dropdown').classList.toggle('hidden');
};
document.getElementById('btnLogout').onclick = () => {
    localStorage.clear();
    location.href = 'index.html'
};

window.onpopstate = () => {
    if (!localStorage.getItem('token')) {
        alert('Faça login para continuar');
        location.href = 'index.html';
    }
};

function renderCards(schedules) {
    cardsContainer.innerHTML = '';
    schedules.forEach(s => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <div class="card-title">
        ${s.name}
        <button class="delete-btn" data-id="${s.id}">&times;</button>
        </div>
        <div class="card-body"></div>
        <div class="card-footer"></div>
      `;
      cardsContainer.appendChild(div);
    });

    //Adiciona event listeners para deletar
    document.querySelectorAll('#cardsContainer .delete-btn').forEach(btn => {
        btn.onclick = async (e) => {
            const id = e.target.dataset.id;
            console.log('Deletando cronograma com ID:', id);
            if(!confirm('Excluir este cronograma?')) return;

            const res = await fetch(`${API}/schedules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`}
            });

            const data = await res.json();

            if(res.ok) {
                //Remove o card do DOM
                e.target.closest('.card').remove();
            } else {
                alert(data.error || 'Erro ao excluir o cronograma');
            }
        };
    });
}

//#############################################################

  