import mongoose from "mongoose";
import { DB_NAME } from "../constrants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}?authSource=admin`
    );

    console.log(
      `\n Mongodb Connected  !! DB Host : ${connectionInstance.connection.host} : ${connectionInstance.connection.port}`
    );
  } catch (error) {
    console.log("Mongodb connect error : ", error);

    process.exit(1);
  }
};

export default connectDB;
