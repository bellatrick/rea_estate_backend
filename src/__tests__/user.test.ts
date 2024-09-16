import request from 'supertest';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

import { User } from '../models/User';
import { app } from '..';
import { mockJwtSign, mockJwtVerify } from './mock/jwt.mock';


dotenv.config();
const mockUserData = {
  email: 'testuser@example.com',
  password: 'password123',
  name: 'Test User',
  phone: '1234567890',
  role: 'tenant'
};

// Mock nodemailer
jest.mock('nodemailer');

// Define a mock implementation for sendMail
const sendMailMock = jest.fn().mockResolvedValue({ success: true });
nodemailer.createTransport = jest.fn().mockReturnValue({
  sendMail: sendMailMock
});
const JWT_SECRET = process.env.ACTIVATION_SECRET || 'testSecret';


// Mock data for the tests

afterAll(async () => {
  await mongoose.disconnect();
});

describe('UserController Tests', () => {
  afterEach(async () => {
    await User.deleteMany({});
    jest.restoreAllMocks();
  });

  // Register User Test
  it('should register a new user', async () => {
    const res = await request(app).post('/api/v1/register').send(mockUserData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  }, 10000);

  it('should return error when trying to register with an existing email', async () => {
    // Seed a user
    await new User(mockUserData).save();

    const res = await request(app).post('/api/v1/register').send(mockUserData); // Using the same email

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  // Login User Test
  it('should log in an existing user', async () => {
    const user = await new User(mockUserData).save();
    // Mock JWT token creation
    mockJwtSign('mockedToken');

    const res = await request(app).post('/api/v1/login').send({
      email: user.email,
      password: mockUserData.password
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token', 'mockedToken');
  });

  it('should return error for invalid login credentials', async () => {
    await new User(mockUserData).save();

    const res = await request(app).post('/api/v1/login').send({
      email: mockUserData.email,
      password: 'wrongpassword'
    });

    expect(res.status).toBe(400);
    expect(res.body.msg).toBe('Invalid credentials');
  });

  // Activate User Test
  it('should activate a user with valid activation token and code', async () => {
    // Mock token verification
    mockJwtVerify({
      user: mockUserData,
      activationCode: '123456' // Expected code
    });

    const res = await request(app).post('/api/v1/activate').send({
      activation_token: 'mockedActivationToken',
      activation_code: '123456'
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return error for invalid activation code', async () => {
    // Mock token verification with incorrect code
    mockJwtVerify({
      user: mockUserData,
      activationCode: 'wrongCode'
    });

    const res = await request(app).post('/api/v1/activate').send({
      activation_token: 'mockedActivationToken',
      activation_code: '123456' // Incorrect code
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid activation code');
  });

  it('should return error if user already exists during activation', async () => {
    // Seed an existing user
    await new User(mockUserData).save();

    // Mock token verification
    mockJwtVerify({
      user: mockUserData,
      activationCode: '123456'
    });

    const res = await request(app).post('/api/v1/activate').send({
      activation_token: 'mockedActivationToken',
      activation_code: '123456'
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });
});

describe('UserController Profile Tests', () => {
  let userId: string;
  let token: string;

  beforeEach(async () => {
    const user = await new User(mockUserData).save();
    userId = (user._id as string).toString();
    token = jwt.sign({ userId: user._id, user: mockUserData }, JWT_SECRET, {
      expiresIn: '1h'
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  // Test for getUserProfile
  it('should return the user profile', async () => {

    const res = await request(app)
      .get(`/api/v1/profile/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(mockUserData.email);
    expect(res.body.name).toBe(mockUserData.name);
  });

  it('should return 404 if user not found', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/v1/profile/${fakeUserId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  // Test for updateUserProfile
  it('should update the user profile', async () => {
    const updatedUserData = {
      name: 'Updated Name',
      email: 'updateduser@example.com',
      phone: '0987654321'
    };

    const res = await request(app)
      .put(`/api/v1/profile/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedUserData);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe(updatedUserData.name);
    expect(res.body.email).toBe(updatedUserData.email);
    expect(res.body.phone).toBe(updatedUserData.phone);
  });

  it('should return 404 if user not found during profile update', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/v1/profile/${fakeUserId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Name',
        email: 'newemail@example.com',
        phone: '0000000000'
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('should return 500 on server error during update', async () => {
    jest.spyOn(User, 'findById').mockImplementationOnce(() => {
      throw new Error('Mocked server error');
    });

    const res = await request(app)
      .put(`/api/v1/profile/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Another Name',
        email: 'another@example.com',
        phone: '1231231234'
      });

    expect(res.status).toBe(500);
    expect(res.text).toBe('Server error');
  });
});
