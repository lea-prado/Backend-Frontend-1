import { Router} from 'express';

//Array para almacenar
let users = [];


const router = Router();

//Metodos GET
router.get('/', (req, res) => {
    res.json(users);
})

export default router;