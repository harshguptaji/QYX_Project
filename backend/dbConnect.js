import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const URI = process.env.MONGO_URI;

        if(!URI){
            console.log("URI Not found");
        }
        await mongoose.connect(URI);
        console.log("Database connected successfully");
    } catch (error) {
        console.log(`Error - ${error}`);
    }
}

