import mongoose from "mongoose";
import { env } from "./env";

let connection: Promise<typeof mongoose> | null = null;

export const connectToDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) {
    return;
  }

  if (!connection) {
    connection = mongoose.connect(env.mongoUri);
  }

  try {
    await connection;
  } catch (error) {
    connection = null;
    throw error;
  }
};
