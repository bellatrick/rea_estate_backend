import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Property } from '../models/Property';
import { User } from '../models/User';
import { MaintenanceRequest } from '../models/MaintenanceRequest';
import { Tenant } from '../models/Tenant';
import { sendMail } from '../utils/sendMail';

export class LandlordController {
  static async addProperty(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, description, rentalTerms, address, images } = req.body;

    try {
      const newProperty = new Property({
        name,
        description,
        rentalTerms,
        address,
        images,
        landlordId: req.user?.id
      });
      await newProperty.save();
      res.status(201).json(newProperty);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
  static async editProperty(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { propertyId } = req.params;
    const { name, description, rentalTerms, address, images } = req.body;

    try {
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      property.name = name;
      property.description = description;
      property.rentalTerms = rentalTerms;
      property.address = address;
      property.images = images;

      await property.save();

      res.status(200).json(property);
    } catch (error) {
      res.status(500).send('Server Error');
    }
  }
  static async deleteProperty(req: Request, res: Response) {
    const {propertyId} = req.params;

    try {
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      await Property.findByIdAndDelete(propertyId);
      res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
      res.status(500).send('Server error');
    }
  }
  static async viewProperties(req: Request, res: Response) {
    try {
      const properties = await Property.find({ landlordId: req.user?.id });
      res.status(200).json(properties);
    } catch (error: any) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
  static async viewTenantProfiles(req: Request, res: Response) {
    try {
      const tenants = await Tenant.find({ landlords: req.user?.id });
      res.status(200).json(tenants);
    } catch (error: any) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
  static async manageMaintenanceRequests(req: Request, res: Response) {
    try {
      const requests = await MaintenanceRequest.find({
        landlordId: req.user?.id
      });
      res.status(200).json(requests);
    } catch (error: any) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
  static async updateRequestStatus(req: Request, res: Response) {
    const { status } = req.body;

    try {
      const request = await MaintenanceRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({ msg: 'Request not found' });
      }

      if (request.landlordId !== req.user?.id) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }

      request.status = status;
      await request.save();
      res.status(200).json(request);
    } catch (err:any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
  static async generateReports(req: Request, res: Response) {
    try {
      // fetch properties and tenants associated with the landlord
      const properties = await Property.find({ landlordId: req.user?.id });
      const tenants = await Tenant.countDocuments({ landlords: req.user?.id });
      const totalIncome = await Tenant.aggregate([
        {
          $match: { landlords: req.user?.id }
        },

        {
          $unwind: '$rent'
        },
        // Group by landlord and sum the rent amounts
        {
          $group: {
            _id: null,
            totalIncome: { $sum: '$rent.amount' }
          }
        }
      ]);
      const total = totalIncome.length > 0 ? totalIncome[0].totalIncome : 0;

      const report = {
        totalProperties: properties.length,
        totalTenants: tenants,
        occupancyRate: tenants / properties.length,
        totalIncome: total
      };
      res.status(200).json(report);
    } catch (error: any) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }

  static async sendNotifications(req: Request, res: Response) {
    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() });
      }

      const { notificationMessage } = req.body;

      const tenants = await Tenant.find({ landlords: req.user?.id }).exec();

      if (!tenants || tenants.length === 0) {
        return res.status(400).json({ errors: [{ msg: 'No tenants found' }] });
      }

      const tenantPromises = tenants.map(async (tenant) => {
        const user = await User.findById(tenant.userId).exec();

        if (!user) {
          return;
        }

        await sendMail({
          email: user.email,
          subject: 'Notification',
          template: 'NotificationMail.ejs',
          data: { notificationMessage,name:user.name }
        });
      });

      await Promise.all(tenantPromises);

      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  }

  static async getAllProperties(req: Request, res: Response) {
    try {
      const properties = await Property.find();
      res.status(200).json(properties);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
}
