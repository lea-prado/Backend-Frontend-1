import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.render('index', { title: 'Inicio' });
});

router.get('/products', (req, res) => {
    res.render('index', { title: 'Lista de Productos' });
});

router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { title: 'Productos en Tiempo Real' });
});

export default router;

