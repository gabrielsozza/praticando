const API = 'http://localhost:3000';

document.getElementById('btnLogin').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    //SALVANDO TOKEN APÓS LOGIN E REDIRECIONANDO
    if( res.ok){
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        window.location.href = 'home.html';
    } else {
        alert(data.error)
    };  
};

document.getElementById('btnSignup').onclick = () => {
    const user = prompt('Usuário:');
    const email = prompt('E-mail:');
    const password = prompt('Senha:');
    fetch(`${API}/signup`, {
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({ username: user, email, password })
    })
    .then(res => res.json())
    .then(data => {
        if(data.error) alert(data.error);
        else alert('Conta criada! ID: ' + data.id);
    })
}

