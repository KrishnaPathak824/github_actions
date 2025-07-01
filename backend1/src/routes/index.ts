import { Router } from 'express';

import userRoutes from './userRoutes';

const router = Router();

router.use('/api/users', userRoutes);

export default router;
