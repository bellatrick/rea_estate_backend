import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { MaintenanceRequest } from '../models/MaintenanceRequest';
import { Payment } from '../models/Payment';
import { User } from '../models/User';
import { Tenant } from '../models/Tenant';

export class TenantController {
  static async addTenantToProperty(req: Request, res: Response) {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    const { userId } = req.params;
    const { propertyId, rentAmount } = req.body;
    const landlordId = req.user?.id;

    if (!userId || !propertyId || !rentAmount || !landlordId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updatedTenant = await Tenant.findOneAndUpdate(
        { userId },
        {
          $push: {
            rentedProperties: propertyId,
            landlords: landlordId,
            rent: { propertyId, amount: Number(rentAmount) }
          }
        },
        { new: true, upsert: true }
      );

      res.status(200).json(updatedTenant);
    } catch (error) {
      res.status(500).send('Server error');
    }
  }

  static async removeTenantFromProperty(req: Request, res: Response) {
    const { tenantId, propertyId } = req.params;
    const landlordId = req?.user?.id;
    if (!landlordId) {
      return res.status(401).send('Unauthorized');
    }

    if (!tenantId || !propertyId) {
      return res.status(400).send('Tenant ID and Property ID are required');
    }

    try {
      const tenant = await Tenant.findOne({ userId: tenantId });
      if (!tenant) {
        return res.status(404).send('Tenant not found');
      }

      const updatedTenant = await Tenant.findOneAndUpdate(
        { userId: tenantId },
        {
          $pull: {
            rentedProperties: propertyId,
            landlords: landlordId,
            rent: { propertyId }
          }
        },
        { new: true }
      );

      if (
        !updatedTenant?.rentedProperties ||
        updatedTenant?.rentedProperties.length === 0
      ) {
        await Tenant.findOneAndDelete({ userId: tenantId });
      }

      res.status(200).json(updatedTenant);
    } catch (error) {
      res.status(500).send('Server error');
    }
  }

  static async payRent(req: Request, res: Response) {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    const { tenantId, propertyId } = req.params;
    const { amount, paymentDate, receiptUrl } = req.body;

    if (!tenantId || !propertyId) {
      return res
        .status(400)
        .json({ message: 'Tenant ID and Property ID are required' });
    }

    try {
      const payment = new Payment({
        tenantId,
        propertyId,
        amount,
        paymentDate,
        receiptUrl
      });
      await payment.save();
      res.status(200).json(payment);
    } catch (error) {
      res.status(500).send('Server error');
    }
  }

  static async submitMaintenanceRequest(req: Request, res: Response) {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }
    const { tenantId, propertyId } = req.params;
    const { landlordId, status, description } = req.body;

    if (!tenantId || !propertyId) {
      return res
        .status(400)
        .json({ message: 'Tenant ID and Property ID are required' });
    }
    try {
      const maintenanceRequest = await new MaintenanceRequest({
        tenantId,
        propertyId,
        landlordId,
        description,
        status
      });
      await maintenanceRequest.save();
    } catch (error: any) {
      console.error(error.message);
      res.status(500).send('server error');
    }
  }

  static async getAllTenantMaintenanceRequests(req: Request, res: Response) {
    if (!req.params.tenantId) {
      return res.status(400).json({ message: 'Please provide a tenant id' });
    }
    try {
      const requests = await MaintenanceRequest.findById({
        tenantId: req.params.tenantId
      }).sort({ createdAt: -1 });
      res.status(200).json(requests);
    } catch (error: any) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }

  static async deleteRequest(req: Request, res: Response) {
    const requestId = req.params.id;
    const userId = req.user?.id;

    try {
      const request = await MaintenanceRequest.findById(requestId);

      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      const isAuthorized =
        request.tenantId === userId || request.landlordId === userId;

      if (!isAuthorized) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await request.deleteOne();
      res.status(200).json({ message: 'Request removed' });
    } catch (error) {
      res.status(500).send('Server error');
    }
  }
  static async getTenant(req: Request, res: Response) {
    try {
      const tenant = await Tenant.findById(req.params.tenantId);
      if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

      return res.status(200).json(tenant);
    } catch (error: any) {
      console.error(error.message)
      res.status(500).send('Sevr error')
    }
  }
}
