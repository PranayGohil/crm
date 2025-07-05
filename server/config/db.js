import mongoose from "mongoose";

const connectUrl = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(connectUrl);
        console.log("database connected");
    } catch (error) {
        console.error("database connection failed", error);
        process.exit(0);
    }
};

export default connectDB;