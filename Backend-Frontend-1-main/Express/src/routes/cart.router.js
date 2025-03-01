// routes/cart.router.js
import { Router } from 'express';
import Cart from '../models/cart.models.js';

const router = Router();

/**
 * POST /api/carts
 * Crear un nuevo carrito vacío
 */
router.post('/', async (req, res) => {
  try {
    const newCart = new Cart({ products: [] });
    await newCart.save();
    res.status(201).json({ message: "Carrito creado", cart: newCart });
  } catch (error) {
    res.status(500).json({ message: "Error al crear carrito", error: error.message });
  }
});

/**
 * GET /api/carts/:cid
 * Obtener un carrito con populate (para ver detalles de cada producto)
 */
router.get('/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });
    res.json({ status: "success", cart });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener carrito", error: error.message });
  }
});

/**
 * DELETE /api/carts/:cid/products/:pid
 * Eliminar un producto específico del carrito
 */
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });
    
    cart.products = cart.products.filter(item => item.product.toString() !== pid);
    await cart.save();
    
    res.json({ message: "Producto eliminado del carrito", cart });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar producto del carrito", error: error.message });
  }
});

/**
 * PUT /api/carts/:cid
 * Actualizar TODO el arreglo de productos del carrito
 */
router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ message: "products debe ser un arreglo" });
    }
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });
    
    cart.products = products;
    await cart.save();
    
    res.json({ message: "Carrito actualizado", cart });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar carrito", error: error.message });
  }
});

/**
 * PUT /api/carts/:cid/products/:pid
 * Actualizar SÓLO la cantidad de un producto del carrito
 */
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });
    
    const productInCart = cart.products.find(item => item.product.toString() === pid);
    if (!productInCart) return res.status(404).json({ message: "Producto no encontrado en el carrito" });
    
    productInCart.quantity = quantity;
    await cart.save();
    
    res.json({ message: "Cantidad actualizada", cart });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar cantidad", error: error.message });
  }
});

/**
 * DELETE /api/carts/:cid
 * Eliminar TODOS los productos del carrito
 */
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });
    
    cart.products = [];
    await cart.save();
    
    res.json({ message: "Todos los productos eliminados del carrito", cart });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar productos del carrito", error: error.message });
  }
});

export default router;
