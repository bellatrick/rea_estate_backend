import { Request, Response, NextFunction } from 'express';

export const onlyLandlord = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        return res.status(401).json({ msg: 'Unauthorized' });
    }
    if (req.user.role !== 'landlord') {
        return res.status(401).json({ msg: 'Unauthorized' });
    }
    next();
}