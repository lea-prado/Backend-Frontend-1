import { Router} from 'express';


//Array para almacenar
let pets = [];


const router = Router();

//Metodos GET
router.get('/', (req, res) => {
    res.json(pets);
})

//Metodos POST
router.post('/', (req, res) => {
    const newPet = req.body;
    pets.push(newPet);
    res.json({message: 'Mascota creada exitosamente'});
})

export default router;