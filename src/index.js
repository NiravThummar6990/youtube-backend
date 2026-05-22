import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

import { app } from "./app.js";

import connectDB from "./db/index.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is running on port  : ${PORT}`);
    });
  })
  .catch((err) => console.log("mongo DB Connecttion error !!!", err));

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MOPNGODB_URI}/${DB_NAME}`);
//   } catch (error) {
//     console.log("Error : ", error);
//   }
// })();
