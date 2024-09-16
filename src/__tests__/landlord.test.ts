import request from 'supertest';
import nodemailer from 'nodemailer';
import { app } from '..';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Tenant } from '../models/Tenant';
import { MaintenanceRequest } from '../models/MaintenanceRequest';

// Mock nodemailer
jest.mock('nodemailer');

// Define a mock implementation for sendMail
const sendMailMock = jest.fn().mockResolvedValue({ success: true });
nodemailer.createTransport = jest.fn().mockReturnValue({
  sendMail: sendMailMock
});

describe('Landlord Routes', () => {
  let landlordId: string;
  let propertyId: string;
  let tenantId: string;
  let maintenanceId: string;
  let token: string;

  beforeEach(async () => {
    // Create a landlord user
    const landlord = await User.create({
      email: 'landlord@example.com',
      password: 'password123',
      name: 'Landlord User',
      phone: '1234567890',
      role: 'landlord'
    });
    landlordId = landlord.id;

    // Create a tenant user
    const tenant = await User.create({
      email: 'tenant@example.com',
      password: 'password123',
      name: 'Tenant User',
      phone: '1234567890',
      role: 'tenant'
    });
    tenantId = tenant.id;

    // Create a property
    const property = await Property.create({
      address: '456 Maple Avenue, Springfield',
      name: 'Cozy Cottage',
      description: 'A charming cottage with a cozy interior.',
      images: ['image3.jpg', 'image4.jpg'],
      rentalTerms: '6 month lease with a monthly rent of $1200.',
      landlordId: landlordId
    });
    propertyId = property.id;

    // Create a maintenance request
    const maintenance = await MaintenanceRequest.create({
      propertyId,
      tenantId,
      landlordId,
      description: 'Leak in the kitchen sink',
      status: 'pending'
    });
    maintenanceId = maintenance.id;
    // Generate a token for the landlord
    token = jwt.sign(
      {
        userId: landlord.id,
        user: { id: landlord.id, ...landlord.toObject() }
      },
      process.env.ACTIVATION_SECRET || 'testSecret',
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Property.deleteMany({});
    await MaintenanceRequest.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('POST /property', () => {
    it('should add a new property', async () => {
      const res = await request(app)
        .post('/api/v1/property')
        .send({
          name: 'New Property',
          address: '789 Oak Street, Springfield',
          description: 'A newly listed property.',
          rentalTerms: '1 year lease, $2000/month',
          images: ['image5.jpg']
        })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('New Property');
    });

    it('should return validation errors if fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/property')
        .send({})
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('PUT /properties/:id', () => {
    it('should update an existing property', async () => {
      const res = await request(app)
        .put(`/api/v1/properties/${propertyId}`)
        .send({
          name: 'Updated Property',
          address: '456 Maple Avenue, Springfield',
          description: 'An updated description for the property.',
          rentalTerms: 'Updated rental terms.',
          images: ['image6.jpg']
        })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should return 404 if property does not exist', async () => {
        const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/v1/properties/${fakeId}`)
        .send({
          name: 'Updated Property',
          address: '456 Maple Avenue, Springfield',
          description: 'An updated description for the property.',
          rentalTerms: 'Updated rental terms.',
          images: ['image6.jpg']
        })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /properties/:id', () => {
    it('should delete an existing property', async () => {
      const res = await request(app)
        .delete(`/api/v1/properties/${propertyId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Property deleted successfully');
    });

    it('should return 404 if property does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/v1/properties/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /properties', () => {
    it('should return all properties for the landlord', async () => {
      const res = await request(app)
        .get('/api/v1/properties')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /tenants', () => {
    it('should return all tenants for the landlord', async () => {
      const res = await request(app)
        .get('/api/v1/tenants')
        .set('Authorization', `Bearer ${token}`);
      console.log(res.body);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /maintenance-requests', () => {
    it('should return all maintenance requests for the landlord', async () => {
      const res = await request(app)
        .get('/api/v1/maintenance-requests')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /reports', () => {
    it('should generate a report for the landlord', async () => {
      await Tenant.findOneAndUpdate(
        { userId: tenantId },
        {
          $push: {
            rentedProperties: propertyId,
            landlords: landlordId,
            rent: { propertyId, amount: 500 }
          }
        },
        { new: true, upsert: true }
      );
      const res = await request(app)
        .get('/api/v1/reports')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.totalProperties).toBeGreaterThan(0);
      expect(res.body.totalTenants).toBeGreaterThan(0);
    });
  });

  describe('POST /notifications', () => {
    it('should send notifications to tenants', async () => {
      await Tenant.findOneAndUpdate(
        { userId: tenantId },
        {
          $push: {
            rentedProperties: propertyId,
            landlords: landlordId,
            rent: { propertyId, amount: 500 }
          }
        },
        { new: true, upsert: true }
      );
      const res = await request(app)
        .post('/api/v1/notifications')
        .send({
          notificationMessage: 'Important update for all tenants.'
        })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      console.log(res.error);
      expect(res.body.success).toBe(true);
    });

    it('should return validation errors if fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/notifications')
        .send({})
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });
});
