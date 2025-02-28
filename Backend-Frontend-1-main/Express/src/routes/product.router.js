// routes/product.router.js
import { Router } from 'express';
import Product from '../models/products.models.js';

const router = Router();

/**
 * GET /api/products
 * Retorna los productos con paginación, filtros y ordenamiento.
 */
router.get('/', async (req, res) => {
  try {
    let { limit, page, sort, query } = req.query;

    limit = parseInt(limit) || 10;
    page  = parseInt(page)  || 1;

    let filter = {};
    if (query) {
      if (query.toLowerCase() === 'true' || query.toLowerCase() === 'false') {
        filter.status = query.toLowerCase() === 'true';
      } else {
        filter.category = query;
      }
    }

    let sortOption = {};
    if (sort === 'asc')  sortOption.price = 1;
    if (sort === 'desc') sortOption.price = -1;

    const totalDocs = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit);

    if (page > totalPages && totalPages > 0) page = totalPages;
    if (page < 1) page = 1;

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    const prevLink = hasPrevPage
      ? `/api/products?limit=${limit}&page=${page - 1}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`
      : null;
    const nextLink = hasNextPage
      ? `/api/products?limit=${limit}&page=${page + 1}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`
      : null;

    res.json({
      status: "success",
      payload: products,
      totalPages,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink
    });
  } catch (error) {
    console.error("Error en GET /api/products:", error);
    res.status(500).json({ status: "error", message: "Error al obtener productos", error: error.message });
  }
});

/**
 * POST /api/products
 * Crea un nuevo producto
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, code, price, status, stock, category } = req.body;
    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }
    const newProduct = new Product({ title, description, code, price, status, stock, category });
    await newProduct.save();
    res.status(201).json({ message: "Producto creado", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Error al crear producto", error: error.message });
  }
});

/**
 * GET /api/products/:pid
 * Detalle de un producto
 */
router.get('/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });
    res.json({ status: "success", product });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener producto", error: error.message });
  }
});

/**
 * DELETE /api/products/:pid
 * Elimina un producto
 */
router.delete('/:pid', async (req, res) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.pid);
    if (!result) return res.status(404).json({ message: "Producto no encontrado" });
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar producto", error: error.message });
  }
});

export default router;
