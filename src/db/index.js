import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        return connectionInstance.connection.readyState === 1;
    } catch(err) {
        console.log("MONOGODB connection FAILED: ", err);
        process.exit(1);  // Please padhiyega 
    }
}

export default connectDB;