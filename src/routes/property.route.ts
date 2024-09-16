import { Router } from "express";
import { PropertyController } from "../controllers/property.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const PropertyRouter=Router();

PropertyRouter.get('/property/:propertyId',authMiddleware, PropertyController.getPropertyById);
export default PropertyRouter