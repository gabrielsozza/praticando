const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const jwt = require('jsonwebtoken');


const SECRET = 'Teste';
const app = express();

const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'frontend')));

//MIDDLEWARE
app.use(cors());
app.use(bodyParser.json());

//CRIA OU ABRE O BANCO SQLite
const db = new sqlite3.Database('./db.sqlite', err =>{
    if(err) return console.error(err.message);
    console.log('Conectado ao SQLite.');
});

//CRIA TABELA DE USUÁRIOS SE NÃO EXISTIR
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT
    )
`)

//CRIANDO A TABELA SCHEDULES
db.run(`
    CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`);


//MIDDLEWARE PARA PROTEGER ROTAS
function auth(req, res, next){
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'Token não fornecido'});
    const [, token] = header.split(' ');
    jwt.verify(token, SECRET, (err, decoded) => {
        if(err) return res.status(401).json({ error: 'Token inválido' });
        req.user = decoded;
        next();
    });
}

//ROTA PARA CRIAR A CONTA
app.post('/signup', (req, res) => {
    const {username, email, password} = req.body;
    const stmt = db.prepare(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
      );
    stmt.run(username, email, password, function(err){
        if(err) return res.status(400).json({error: err.message});
        const token = jwt.sign({ id: this.lastID, username }, SECRET, { expiresIn: '2h' });
        res.json({id: this.lastID, username, token});
    });
    stmt.finalize();
});

//ROTA PARA LOGIN
app.post('/login', (req, res) => {
    const{ email, password } = req.body;
    db.get(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password],
        (err, row) => {
        if(err) return res.status(500).json({error: err.message});
        if(!row) return res.status(401).json({error: 'Credenciais Inválidas'});
        const token = jwt.sign(
            { id: row.id, username: row.username }, 
            SECRET, 
            { expiresIn: '2h' }
        );
        res.json({id: row.id, username: row.username, token});
        }
    );
});

//PROTEGENDO HOME
app.get('/home', auth, (req, res) => {
    //retornar dados iniciais: lista de cronogramas
    db.all('SELECT * FROM schedules WHERE user_id = ?', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message});
        res.json({ username: req.user.username, schedules: rows});
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));






