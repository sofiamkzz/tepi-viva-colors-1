require('dotenv').config();
require('./models/relations');

const express = require('express');
const session = require('express-session');
const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const sequelize = require('./config/database');
const indexRoutes = require('./routes/indexRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');

const app = express();
const port = 3000;

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API da Papelaria Viva Colors',
            version: '1.0.0',
            description: 'Documentação da API de um aplicativo de e-commerce',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 3600000,
    },
}));

sequelize.sync({ alter: true })
    .then(() => {
        console.log("Banco de dados sincronizado!");
    })
    .catch((error) => {
        console.error("Erro ao sincronizar o banco de dados: ", error);
    });

app.use("/", indexRoutes);  
app.use(userRoutes);
app.use(authRoutes);
app.use(cartRoutes);
app.use(favoritesRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
