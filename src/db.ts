import mongoose from 'mongoose';

export const connectToDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    return await mongoose.connect(process.env.TEST_DB as string);
  } else {
    return await mongoose
      .connect(process.env.MONGO_URI as string)
      .then(() => {
        console.log('Connected to MongoDB');
      })
      .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
      });
  }
};
