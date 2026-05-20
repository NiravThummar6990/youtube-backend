import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDB from "./db/index.js";

connectDB();





// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MOPNGODB_URI}/${DB_NAME}`);
//   } catch (error) {
//     console.log("Error : ", error);
//   }
// })();
