// require("dotenv/config");
// import express from "express";
// import morgan from "morgan";
// import fs from "fs";
// import path from "path";
// import routes from "./routes";
// import auth from "./middleware/auth";
// import cors from "cors";
// const app = express();

// const accessLogStream = fs.createWriteStream(
//   path.join(__dirname, "../access.log"),
//   { flags: "a" }
// );

// // middlewares
// app.use(cors());
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// app.use(morgan("combined", { stream: accessLogStream }));

// // routes
// app.get("/uploads/images/:directory/:file", function (req, res) {
//   let directoryName = req.params.directory;
//   let fileName = req.params.file;
//   res.sendFile(
//     path.join(__dirname) + `/uploads/images/${directoryName}/${fileName}`
//   );
// });
// app.use("/uploads", express.static("uploads"));
// app.use("/api/payout", auth, routes.payout);
// app.use("/api/common", routes.common);
// app.use("/api/auth", routes.authAccess);
// app.use("/api/profile", auth, routes.profile);
// app.use("/api/home", auth, routes.home);
// app.use("/api/ewallet", auth, routes.ewallet);
// app.use("/api/epin", auth, routes.epin);
// app.use("/api/package", auth, routes.packages);
// app.use("/api/report", auth, routes.report);
// app.use("/api/api_register", auth, routes.signup);
// app.use("/api/tools", auth, routes.tools);
// app.use("/api/tree", auth, routes.tree);
// app.use("/api/mail", auth, routes.mail);
// app.use("/api/ticket", auth, routes.ticket);
// app.use("/api/payment", auth, routes.payment);
// app.use("/api/upgrade", auth, routes.upgrade);
// app.use("/api/crm", auth, routes.crm);
// app.use("/api/lcp", routes.lcp);
// app.use("/api/replica", routes.replica);
// app.use("/api/donation", auth, routes.donation);
// app.use("/api/replica_register", routes.replicaRegister);
// app.use("/api/party", auth, routes.party);
// app.use("/api/order", auth, routes.order);

// // app.use("/api/usdtWallet", auth, routes.usdtWallet);
// app.use("/api/bebWallet", auth, routes.bebWallet);
// // welcome page
// app.use((req, res) => {
//   res.status(200).send("Welcome to maveriq application");
// });

// // listening port
// app.listen(process.env.PORT, () => {
//   console.log(`Server is running maveriq ${process.env.PORT}`);
// });

//new server js

require("dotenv/config");
import express from "express";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import webRoutes from "./routes/web";
import appRoutes from "./routes/app";
import cors from "cors";
const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "../access.log"),
  { flags: "a" }
);

// middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("combined", { stream: accessLogStream }));

// routes
app.get("/api/uploads/images/:directory/:file", function (req, res) {
  let directoryName = req.params.directory;
  let fileName = req.params.file;
  res.sendFile(
    path.join(__dirname) + `/uploads/images/${directoryName}/${fileName}`
  );
});
app.use("/uploads", express.static("uploads"));

webRoutes(app);
appRoutes(app);

// welcome page
app.use((req, res) => {
  res.status(200).json(`Welcome to the application ${process.env.test1}`);
});

// listening port
app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});
