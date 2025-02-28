import mongoose from "mongoose";
import { Db_name } from "../constants.js";

const connectDB = async () => {
    try {
        const connectioninstance = await mongoose.connect(`${process.env.DATABASE_URL}/${Db_name}`)
        console.log(`mongodb connect ${connectioninstance.connection.host}`)
    } catch (error) {
        console.log(`oops!, connection error is ${error}`);
    }
}

export default connectDB