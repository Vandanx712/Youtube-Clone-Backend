import dotenv from 'dotenv';
import connectDB from './DB/db.js'
import {app} from "./app.js";
import { User } from "../chai aur backend/Models/user.model.js";

const port = process.env.PORT || 5050
dotenv.config();


await connectDB()
// const autoUpdateFields = async () => {
//   try {
//       const defaultValues = {
//           roles: "user",  // Add default value for role
//       };
//       let modifiedCount = 0;

//       for (const field in defaultValues) {
//           const result = await User.updateMany(
//               { [field]: { $exists: false } }, // Check if field is missing
//               { $set: { [field]: defaultValues[field] } } // Set default value
//           );
//           modifiedCount += result.modifiedCount;
//       }
//       console.log(`All missing fields updated successfully!`);
//   } catch (error) {
//       console.error("Error updating missing fields:", error);
//   }
// };

// await autoUpdateFields()

 app.listen(port,()=>{
    console.log(`app listen on port ${port}`);
 })
 