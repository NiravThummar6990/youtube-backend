import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is running on post  : ${process.env.PORT}`);
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
