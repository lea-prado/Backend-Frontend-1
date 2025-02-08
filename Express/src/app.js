import express from 'express';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import handlebars from 'express-handlebars';
import __dirname from './util.js';

// Importar routers
import userRouter from './routes/user.router.js';
import petRouter from './routes/pet.router.js';
import productRouter from './routes/product.router.js';
import cartRouter from './routes/cart.router.js';
import viewsRouter from './routes/views.router.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server);

// Middleware para analizar solicitudes y servir archivos estáticos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Configurar motor de plantillas Handlebars
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

// Implementar routers con Socket.IO
app.use('/api/users', userRouter);
app.use('/api/pets', petRouter);
app.use('/api/products', productRouter(io));
app.use('/api/carts', cartRouter(io));
app.use('/', viewsRouter);

// Configurar socket.io
let products = [];
let carts = [];
let currentCartId = 1;

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
    socket.emit('updateProducts', products);

    socket.on('newProduct', (product) => {
        const newProduct = { id: products.length + 1, ...product };
        products.push(newProduct);
        io.emit('updateProducts', products);
    });

    socket.on('deleteProduct', (productId) => {
        products = products.filter((p) => p.id !== productId);
        io.emit('updateProducts', products);
    });

    socket.on('addToCart', (productId) => {
        let cart = carts.find(c => c.id === 1);
        if (!cart) {
            cart = { id: currentCartId++, products: [] };
            carts.push(cart);
        }
        const existingProduct = cart.products.find(p => p.product === productId);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }
        io.emit('updateCart', cart.products);
    });

    socket.on('removeFromCart', (productId) => {
        let cart = carts.find(c => c.id === 1);
        if (cart) {
            cart.products = cart.products.filter(p => p.product !== productId);
            io.emit('updateCart', cart.products);
        }
    });
});

// Ruta para la vista principal con productos en tiempo real
app.get('/', (req, res) => {
    res.render('realTimeProducts', { title: 'Productos en Tiempo Real', products });
});

server.listen(8080, () => {
    console.log('Servidor escuchando en http://localhost:8080');
});
