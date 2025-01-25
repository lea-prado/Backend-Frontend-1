import { Router } from 'express';

let products = []; // Array para almacenar productos
let currentId = 1; // Variable para generar IDs únicos

const router = Router();

// Ruta raíz: Listar todos los productos (GET /)
router.get('/', (req, res) => {
    res.json(products);
});

// Ruta para obtener un producto por ID (GET /:pid)
router.get('/:pid', (req, res) => {
    const { pid } = req.params;
    const product = products.find(p => p.id === parseInt(pid));

    if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    res.json(product);
});

// Ruta para agregar un nuevo producto (POST /)
router.post('/', (req, res) => {
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

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
    if (!Array.isArray(thumbnails)) {
        return res.status(400).json({ message: 'El campo "thumbnails" debe ser un array de strings.' });
    }

    // Crear el nuevo producto con un ID único
    const newProduct = {
        id: currentId++, // Autogenerar ID
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails
    };

    products.push(newProduct);
    res.status(201).json({ message: 'Producto creado exitosamente', product: newProduct });
});

// Ruta para actualizar un producto (PUT /:pid)
router.put('/:pid', (req, res) => {
    const { pid } = req.params;
    const productIndex = products.findIndex(p => p.id === parseInt(pid));

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    const updates = req.body;

    // Evitar que se actualice el ID
    if (updates.id) {
        return res.status(400).json({ message: 'No se puede actualizar el campo "id".' });
    }

    // Actualizar solo los campos válidos
    products[productIndex] = { ...products[productIndex], ...updates };

    res.json({ message: 'Producto actualizado exitosamente.', product: products[productIndex] });
});

// Ruta para eliminar un producto (DELETE /:pid)
router.delete('/:pid', (req, res) => {
    const { pid } = req.params;
    const productIndex = products.findIndex(p => p.id === parseInt(pid));

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    // Eliminar el producto
    products.splice(productIndex, 1);
    res.json({ message: 'Producto eliminado exitosamente.' });
});

export default router;
