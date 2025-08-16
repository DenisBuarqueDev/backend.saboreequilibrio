const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const cookieParser = require("cookie-parser");
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cookieParser());

// Aceita requisições do front-end (React)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', userRoutes);

const categoryRoutes = require('./src/routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);

const productRoutes = require('./src/routes/productRoutes');
app.use('/api/products', productRoutes);

const orderRoutes = require('./src/routes/orderRoutes');
app.use('/api/orders', orderRoutes);

const likeRoutes = require('./src/routes/likeRoutes');
app.use('/api/likes', likeRoutes);

const commentRoutes = require('./src/routes/commentRoutes');
app.use('/api/comments', commentRoutes);

const addressRoutes = require('./src/routes/addressRoutes');
app.use('/api/addresses', addressRoutes);

const webhookRoutes = require("./src/routes/webhook");
app.use("/api/webhook", webhookRoutes);

const mercadoPagoRoutes = require("./src/routes/mercadoPago");
app.use("/api/mercado-pago", mercadoPagoRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// Test route
app.get('/', (req, res) => {
  res.send('API funcionando!');
});

// Porta
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
