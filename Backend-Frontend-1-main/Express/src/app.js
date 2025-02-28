// app.js
import express from 'express';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import __dirname from './util.js';

// Importar modelos para usarlos en eventos de socket
import Product from './models/products.models.js';
import Cart from './models/cart.models.js';

// Routers
import productRouter from './routes/product.router.js';
import cartRouter from './routes/cart.router.js';
import viewsRouter from './routes/views.router.js';

// Cargar variables de entorno
dotenv.config();
const URLMongoDB = process.env.URLMongoDB || "mongodb://localhost:27017/miBase";
const PORT = process.env.PORT || 8080;

// Conexión a MongoDB
mongoose.connect(URLMongoDB)
  .then(() => console.log("Conexión a base de datos exitosa"))
  .catch((error) => {
    console.error("Error en la conexión:", error);
    process.exit();
  });

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public')); // Carpeta estática opcional

// Configuración de Handlebars
app.engine('handlebars', handlebars.engine({
  defaultLayout: 'main', // Usa views/layouts/main.handlebars
  layoutsDir: __dirname + '/views/layouts'
}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

// Rutas de la API
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);

// Rutas de vistas
app.use('/', viewsRouter);

// --- Socket.IO: Eventos en tiempo real ---
io.on('connection', async (socket) => {
  console.log("Nuevo cliente conectado");

  // Al conectar, enviar la lista actual de productos
  const products = await Product.find().lean();
  socket.emit('updateProducts', products);

  // Crear nuevo producto desde la vista realTimeProducts.handlebars
  socket.on('newProduct', async (data) => {
    try {
      const { title, price } = data;
      const newProduct = new Product({
        title,
        price,
        description: 'Sin descripción',
        code: 'default-code',
        stock: 10,
        category: 'general'
      });
      await newProduct.save();
      // Emitir la lista actualizada
      const updatedProducts = await Product.find().lean();
      io.emit('updateProducts', updatedProducts);
    } catch (error) {
      console.error("Error al agregar producto:", error);
      socket.emit('error', { message: "No se pudo agregar el producto" });
    }
  });

  // Agregar un producto al carrito
  socket.on('addToCart', async ({ cartId, productId, quantity }) => {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        return socket.emit('error', { message: "Carrito no encontrado" });
      }
      // Verificar si el producto ya existe en el carrito
      const existingProduct = cart.products.find(item => item.product.toString() === productId);
      if (existingProduct) {
        existingProduct.quantity += quantity || 1;
      } else {
        cart.products.push({ product: productId, quantity: quantity || 1 });
      }
      await cart.save();

      // Emitir el carrito actualizado
      const updatedCart = await Cart.findById(cartId).populate('products.product').lean();
      io.emit('updateCart', updatedCart);
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error);
      socket.emit('error', { message: "No se pudo agregar el producto al carrito" });
    }
  });

  // Eliminar un producto del carrito
  socket.on('removeFromCart', async ({ cartId, productId }) => {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        return socket.emit('error', { message: "Carrito no encontrado" });
      }
      cart.products = cart.products.filter(item => item.product.toString() !== productId);
      await cart.save();

      const updatedCart = await Cart.findById(cartId).populate('products.product').lean();
      io.emit('updateCart', updatedCart);
    } catch (error) {
      console.error("Error al eliminar producto del carrito:", error);
      socket.emit('error', { message: "No se pudo eliminar el producto del carrito" });
    }
  });

  // Obtener el carrito actual
  socket.on('getCart', async ({ cartId }) => {
    try {
      const cart = await Cart.findById(cartId).populate('products.product').lean();
      socket.emit('cartUpdated', cart);
    } catch (error) {
      console.error("Error al obtener el carrito:", error);
      socket.emit('error', { message: "No se pudo obtener el carrito" });
    }
  });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
