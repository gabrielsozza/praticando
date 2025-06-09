const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const SECRET = 'Teste';
const app = express();

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
`);


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

//ROTA PARA CRIAR A CONTA - parei aqui!!!
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
    db.all(
        'SELECT * FROM schedules WHERE user_id = ?',
        [req.user.id], 
        (err, rows) => {
        if (err) return res.status(500).json({ error: err.message});
        res.json({ username: req.user.username, schedules: rows});
    });
});

//ROTA PARA CRIAR CRONOGRAMA
app.post('/schedules', auth, (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;
    const stmt = db.prepare(
        'INSERT INTO schedules (user_id, name) VALUES (?, ?)'
    );
    stmt.run(userId, name, function(err){
        if(err) return res.status(500).json({ error: err.message});
        //Retorna o novo cronograma
        res.json({ id: this.lastID, name });
    });
    stmt.finalize();
});

//ROTA PARA DELETAR CRONOGRAMA
app.delete('/schedules/:id', auth, (req, res) => {
    const { id } = req.params;
    //Garante que o cronograma pertence ao usuário
    db.run(
        'DELETE FROM schedules WHERE id = ? AND user_id = ?',
        [id, req.user.id],
        function(err) {
            if(err) return res.status(500).json({ error: err.message });
            if(this.changes === 0) 
                return res.status(404).json({ error: 'Cronograma não encontrado' });
            console.log(`Cronograma com ID ${id} foi excluído.`);
            res.json({ success: true });
        }
    );
});

// --- Middleware de arquivos estáticos (depois das rotas API) ---
app.use(express.static(path.join(__dirname, '..', 'frontend')));


const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

//##########

// ROTA PARA OBTER UM CRONOGRAMA ESPECÍFICO
app.get('/schedules/:id', auth, (req, res) => {
    const { id } = req.params;
    db.get(
        'SELECT * FROM schedules WHERE id = ? AND user_id = ?',
        [id, req.user.id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Cronograma não encontrado' });
            res.json(row);
        }
    );
});
  