//will build the http server where the backend will run for the application
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

import notesRouter from "./routes/note.route.js";



dotenv.config()
const app = express();
const port = process.env.PORT || 4002

// app.get('/', (req, res) => {
//   //res.send('Bye World');
//   res.send("Kya hua ");
// });

//DATABASE CONNECTION CODE
mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.log("Error connecting to MongoDB:", err));

mongoose.connection.on('connected', () => console.log('Mongoose connected'));
mongoose.connection.on('error', (err) => console.log('Mongoose error:', err));
mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected'));


//Routing MiddleWare 
app.use(express.json());
app.use("/api/v1/notesapp", notesRouter);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});