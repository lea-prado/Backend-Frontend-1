import { Router } from 'express';

let carts = []; // Array para almacenar los carritos
let currentCartId = 1; // Variable para generar IDs únicos para los carritos

const router = Router();

// Ruta raíz: Crear un nuevo carrito (POST /)
router.post('/', (req, res) => {
    const newCart = {
        id: currentCartId++, // Generar un ID único
        products: [] // Inicializar el carrito vacío
    };

    carts.push(newCart);
    res.status(201).json({ message: 'Carrito creado exitosamente.', cart: newCart });
});

// Ruta para obtener los productos de un carrito por ID (GET /:cid)
router.get('/:cid', (req, res) => {
    const { cid } = req.params;
    const cart = carts.find(c => c.id === parseInt(cid));

    if (!cart) {
        return res.status(404).json({ message: 'Carrito no encontrado.' });
    }

    res.json(cart.products);
});

// Ruta para agregar un producto al carrito (POST /:cid/product/:pid)
router.post('/:cid/product/:pid', (req, res) => {
    const { cid, pid } = req.params;

    const cart = carts.find(c => c.id === parseInt(cid));
    if (!cart) {
        return res.status(404).json({ message: 'Carrito no encontrado.' });
    }

    // Buscar si el producto ya existe en el carrito
    const existingProduct = cart.products.find(p => p.product === parseInt(pid));

    if (existingProduct) {
        // Incrementar la cantidad si el producto ya existe
        existingProduct.quantity += 1;
    } else {
        // Agregar el producto como un nuevo objeto en el carrito
        cart.products.push({ product: parseInt(pid), quantity: 1 });
    }

    res.status(201).json({ message: 'Producto agregado al carrito.', cart });
});

export default (io) => {
    const router = Router();

    router.post('/', (req, res) => {
        res.json({ message: 'Carrito creado' });
    });

    return router;
};