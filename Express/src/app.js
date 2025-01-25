import express from 'express';

//Importar los routers
import userRouter from './routes/user.router.js';
import petRouter from './routes/pet.router.js';
import productRouter from './routes/product.router.js';
import cartRouter from './routes/cart.router.js';

const app = express();

//Middleware para analizar el cuerpo de las solicitudes
app.use(express.json());
app.use(express.urlencoded({extended: true})); 

//Inicializar el servidor
app.listen(8080, () => {
    console.log("Servidor escuchando");
})

//Implementamos los routers que creamos
app.use('/api/users', userRouter);
app.use('/api/pets', petRouter);
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);