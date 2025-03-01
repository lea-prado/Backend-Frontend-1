// routes/views.router.js
import { Router } from 'express';
import Product from '../models/products.models.js';
import Cart from '../models/cart.models.js';

const router = Router();

/**
 * GET /
 * Redirige a /products
 */
router.get('/', (req, res) => {
  return res.redirect('/products');
});

/**
 * GET /products
 * Renderiza la vista con paginación de productos (index.handlebars).
 */
router.get('/products', async (req, res) => {
  try {
    let { limit, page, sort, query } = req.query;
    
    limit = parseInt(limit) || 10;
    page  = parseInt(page)  || 1;

    let filter = {};
    if (query) {
      // Filtrar por status (true/false) o categoría
      if (query.toLowerCase() === 'true' || query.toLowerCase() === 'false') {
        filter.status = query.toLowerCase() === 'true';
      } else {
        filter.category = query;
      }
    }

    let sortOption = {};
    if (sort === 'asc')  sortOption.price = 1;
    if (sort === 'desc') sortOption.price = -1;

    const totalDocs  = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit);

    // Ajustar la página si se sale de rango
    if (page > totalPages && totalPages > 0) page = totalPages;
    if (page < 1) page = 1;

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = page - 1;
    const nextPage = page + 1;

    const prevLink = hasPrevPage
      ? `/products?limit=${limit}&page=${prevPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`
      : null;
    const nextLink = hasNextPage
      ? `/products?limit=${limit}&page=${nextPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`
      : null;

    // Renderizamos la vista "index.handlebars"
    // También podríamos responder JSON, pero en vistas normalmente renderizamos HTML
    res.render('index', {
      title: 'Lista de Productos',
      products,
      totalPages,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink
    });
  } catch (error) {
    console.error("Error en GET /products:", error);
    res.status(500).send("Error al obtener productos");
  }
});

/**
 * GET /products/:pid
 * Vista de detalle de un producto
 */
router.get('/products/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) return res.status(404).send("Producto no encontrado");
    res.render('productDetail', { title: product.title, product });
  } catch (error) {
    res.status(500).send("Error al obtener el producto");
  }
});

/**
 * GET /carts/:cid
 * Vista de un carrito específico (con populate).
 */
router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
    if (!cart) return res.status(404).send("Carrito no encontrado");
    
    res.render('cartDetail', { 
      title: 'Detalle del Carrito', 
      cart 
    });
  } catch (error) {
    res.status(500).send("Error al obtener el carrito");
  }
});

/**
 * GET /cartrealtime
 * Vista de carrito en tiempo real (Socket.io)
 */
router.get('/cartrealtime', (req, res) => {
  res.render('cartRealTime', { title: "Carrito en Tiempo Real" });
});

/**
 * GET /realtimeproducts
 * Vista de productos en tiempo real (Socket.io)
 */
router.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts', { title: "Productos en Tiempo Real" });
});

export default router;
