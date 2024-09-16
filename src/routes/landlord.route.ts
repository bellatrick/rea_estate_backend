import { Router } from 'express';
import { check } from 'express-validator';
import { LandlordController } from '../controllers/landlord.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { onlyLandlord } from '../middlewares/onlyLandlord';

const landlordRouter = Router();

landlordRouter.post(
  '/property',
  authMiddleware,
  onlyLandlord,
  [
    check('name', 'Property name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('rentalTerms', 'Rental terms are required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('images', 'Images are required').isArray({ min: 1 })
  ],
  LandlordController.addProperty
);

landlordRouter.put(
  '/properties/:propertyId',
  authMiddleware,
  onlyLandlord,
  [
    check('name', 'Property name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('rentalTerms', 'Rental terms are required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('images', 'Images are required').isArray({ min: 1 })
  ],
  LandlordController.editProperty
);

landlordRouter.delete(
  '/properties/:propertyId',
  authMiddleware,
  onlyLandlord,
  LandlordController.deleteProperty
);
landlordRouter.get(
  '/tenants',
  authMiddleware,
  onlyLandlord,
  LandlordController.viewTenantProfiles
);

landlordRouter.get(
  '/properties',
  authMiddleware,
  onlyLandlord,
  LandlordController.viewProperties
);

landlordRouter.get(
  '/maintenance-requests',
  authMiddleware,
  onlyLandlord,
  LandlordController.manageMaintenanceRequests
);

landlordRouter.get(
  '/reports',
  authMiddleware,
  onlyLandlord,
  LandlordController.generateReports
);

landlordRouter.post(
  '/notifications',
  authMiddleware,
  onlyLandlord,
  [check('notificationMessage', 'Message is required').not().isEmpty()],
  LandlordController.sendNotifications
);

landlordRouter.put(
  '/maintenance-request/:id/status',
  authMiddleware,
  onlyLandlord,
  LandlordController.updateRequestStatus
);
export default landlordRouter;
