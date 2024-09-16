import { Router } from 'express';
import { TenantController } from '../controllers/tenant.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { onlyLandlord } from '../middlewares/onlyLandlord';
import { check } from 'express-validator';

const TenantRouter = Router();

TenantRouter.put(
  '/property/:userId',
  authMiddleware,
  onlyLandlord,
  [
    check('propertyId', 'Property ID is required').not().isEmpty(),
    check('rentAmount', 'Rent amount is required').not().isEmpty()
  ],
  TenantController.addTenantToProperty
);
TenantRouter.delete(
  '/tenant/:tenantId/property/:propertyId',
  authMiddleware,
  onlyLandlord,
  TenantController.removeTenantFromProperty
);

TenantRouter.post(
  '/payment/:tenantId/:propertyId',
  authMiddleware,
  [
    check('amount', 'Amount is required').not().isEmpty(),
    check('paymentDate', 'Payment date is required').not().isEmpty(),
    check('receiptUrl', 'Receipt URL is required').not().isEmpty()
  ],
  TenantController.payRent
);
TenantRouter.post(
  '/tenant/maintenanceRequest/:tenantId/:propertyId',
  authMiddleware,
  [
    check('description', 'Description is required').not().isEmpty(),
    check('status', 'Status is required').isIn([
      'pending',
      'in-progress',
      'resolved'
    ]),
    check('landlordId', 'LandlordId is required').not().isEmpty()
  ],
  TenantController.submitMaintenanceRequest
);

TenantRouter.get(
  '/tenant/:tenantId/maintenance-requests',
  TenantController.getAllTenantMaintenanceRequests
);

TenantRouter.delete(
  '/maintenance-request/:id',
  authMiddleware,
  TenantController.deleteRequest
);

TenantRouter.get(
  '/tenant/:tenantId',
  authMiddleware,
  TenantController.getTenant
);

export default TenantRouter;
