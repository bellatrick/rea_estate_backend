import { Request,Response } from "express";
import { Property } from "../models/Property";

export class PropertyController {
    static async getPropertyById(req: Request, res: Response) {
        try {
          const property = await Property.findById(req.params.id);

          if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
          }

          res.status(200).json(property);
        } catch (err:any) {
          console.error(err.message);
          res.status(500).send('Server error');
        }
      }
}