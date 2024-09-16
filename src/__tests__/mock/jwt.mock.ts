import jwt from 'jsonwebtoken';

// Mock the jwt.verify method
export const mockJwtVerify = (decodedToken: any) => {
  jest.spyOn(jwt, 'verify').mockImplementation(() => decodedToken);
};

// Mock the jwt.sign method (for generating login tokens)
export const mockJwtSign = (token: string) => {
  jest.spyOn(jwt, 'sign').mockImplementation(() => token);
};
