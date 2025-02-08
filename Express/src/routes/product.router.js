import { Router } from 'express';

let products = []; // Array para almacenar productos
let currentId = 1; // Variable para generar IDs únicos

const router = Router();

export default (io) => {
    const router = Router();

    router.post('/', (req, res) => {
        res.json({ message: 'Carrito creado' });
    });

    return router;
};
    // Ruta para agregar un nuevo producto (POST /)
    router.post('/', (req, res) => {
        const { title, description, code, price, status = true, stock, category } = req.body;

        // Validación de campos requeridos y sus tipos
        if (!title || typeof title !== 'string') {
            return res.status(400).json({ message: 'El campo "title" es requerido y debe ser un string.' });
        }
        if (!description || typeof description !== 'string') {
            return res.status(400).json({ message: 'El campo "description" es requerido y debe ser un string.' });
        }
        if (!code || typeof code !== 'string') {
            return res.status(400).json({ message: 'El campo "code" es requerido y debe ser un string.' });
        }
        if (price === undefined || typeof price !== 'number') {
            return res.status(400).json({ message: 'El campo "price" es requerido y debe ser un número.' });
        }
        if (typeof status !== 'boolean') {
            return res.status(400).json({ message: 'El campo "status" debe ser un booleano.' });
        }
        if (stock === undefined || typeof stock !== 'number') {
            return res.status(400).json({ message: 'El campo "stock" es requerido y debe ser un número.' });
        }
        if (!category || typeof category !== 'string') {
            return res.status(400).json({ message: 'El campo "category" es requerido y debe ser un string.' });
        }

        // Crear el nuevo producto con un ID único
        const newProduct = {
            id: currentId++,
            title,
            description,
            code,
            price,
            status,
            stock,
            category
        };

        products.push(newProduct);
        io.emit('updateProducts', products); // Emitir evento para actualizar productos en tiempo real
        res.status(201).json({ message: 'Producto creado exitosamente', product: newProduct });
    });

    // Ruta para eliminar un producto (DELETE /:pid)
    router.delete('/:pid', (req, res) => {
        const { pid } = req.params;
        const productIndex = products.findIndex(p => p.id === parseInt(pid));

        if (productIndex === -1) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        products.splice(productIndex, 1);
        io.emit('updateProducts', products); // Emitir evento para actualizar productos en tiempo real
        res.json({ message: 'Producto eliminado exitosamente.' });
    });

