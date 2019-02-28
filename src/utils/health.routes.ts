import * as express from 'express';
import { NextFunction, Request, Response } from 'express';

const router: express.Router = express.Router();

router.get('/health', (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send({ status: 'ok' });
});

export default router;
