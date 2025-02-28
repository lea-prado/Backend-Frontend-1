import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
  res.json({ message: "Endpoint de usuarios" });
});

export default router;
