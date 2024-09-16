import request from 'supertest';
import { app } from '..';
import { TenantController } from '../controllers/tenant.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { onlyLandlord } from '../middlewares/onlyLandlord';
import TenantRouter from '../routes/tenant.route';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Tenant } from '../models/Tenant';

describe('Tenant Routes', () => {
  let userId: string;
  let propertyId: string;
  let tenantId: string;
  let token: string;
  beforeEach(async () => {
    const user = await User.create({
      email: 'testusersss@example.com',
      password: 'password123',
      name: 'Test User',
      phone: '1234567890',
      role: 'landlord'
    });
    userId = user.id;

    const tenant = await User.create({
      email: 'testuser1@example.com',
      password: 'password123',
      name: 'Test User1',
      phone: '1234567890',
      role: 'tenant'
    });
    tenantId = tenant.id;

    const property = await Property.create({
      address: '123 Elm Street, Springfield',
      name: 'Sunny Villa',
      description: 'A beautiful villa with a large garden and pool.',
      images: ['image1.jpg', 'image2.jpg'],
      rentalTerms: '1 year lease with a monthly rent of $1500.',
      currentTenantId: null,
      landlordId: userId
    });
    propertyId = property.id;

    token = jwt.sign(
      { userId: user.id, user: { id: user.id, ...user.toObject() } },
      process.env.ACTIVATION_SECRET || 'testSecret',
      { expiresIn: '1h' }
    );
  });
  afterEach(async () => {
    await User.deleteMany({});
    await Property.deleteMany({});
  });
  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('PUT /property/:userId', () => {
    it('should add tenant to property', async () => {
      const res = await request(app)
        .put(`/api/v1/property/${tenantId}`)
        .send({
          propertyId,
          rentAmount: 500
        })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should return validation errors if fields are missing', async () => {
      const res = await request(app)
        .put(`/api/v1/property/${tenantId}`)
        .send({})
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('DELETE /tenant/:tenantId/property/:propertyId', () => {
    it('should remove tenant from property', async () => {
      await Tenant.findOneAndUpdate(
        { userId: tenantId },
        {
          $push: {
            rentedProperties: propertyId,
            landlords: userId,
            rent: { propertyId, amount: 500 }
          }
        },
        { new: true, upsert: true }
      );
      const res = await request(app)
        .delete(`/api/v1/tenant/${tenantId}/property/${propertyId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      const tenant = await Tenant.findOne({ userId: tenantId });
      expect(tenant).toBeNull()
    });
  });

  describe('POST /payment/:tenantId/:propertyId', () => {
    it('should pay rent', async () => {
      const res = await request(app)
        .post(`/api/v1/payment/${tenantId}/${propertyId}`)
        .send({
          amount: 1000,
          paymentDate: '2023-01-01',
          receiptUrl: 'http://example.com/receipt'
        })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

    });

    it('should return validation errors if required fields are missing', async () => {
      const res = await request(app)
        .post(`/api/v1/payment/${tenantId}/${propertyId}`)
        .send({})
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });


});

