require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const sequelize = require('./config/database');

const userRoutes = require('./routes/userRoutes'); 
const authRoutes = require('./routes/authRoutes'); 
const cartRoutes = require('./routes/cartRoutes'); 

const authenticateToken = require('./middleware/auth');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

// Middleware para sessões
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_default_secret_key', // Use uma variável de ambiente
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

// Sincronizando o banco de dados
sequelize.sync({ force: true }).then(() => {
    console.log('Banco de dados sincronizado..');
});

// Rota principal (GET)
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Rota de Login e Logout
app.use('/', authRoutes);

// Rotas de Usuário
app.use('/user', userRoutes);

// Rotas de Carrinho
app.use('/carrinho', cartRoutes);

// Rota de Admin (Protegida por Middleware de Admin, caso necessário)
app.get('/admin', isAdmin, async (req, res) => {
    try {
        // Buscar todos os usuários no banco de dados
        const users = await User.findAll();
        res.render('admin', { usuarios: users || [] });
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).send('Erro ao carregar a lista de usuários');
    }
});

// Outras rotas do site
app.get('/favoritos', (req, res) => {
    res.render('favoritos');
});

app.get('/historico', (req, res) => {
    res.render('historico');
});

// Servidor ouvindo na porta 3000
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
