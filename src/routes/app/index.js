import auth from "../../middleware/app/auth";
import ewallet from "./ewallet";
import home from "./home";
import payout from "./payout";
import common from "./common";
import authAccess from "./authAcess";
import profile from "./profile";
import epin from "./epin";
import packages from "./packages";
import report from "./report";
import signup from "./signup";
import tools from "./tools";
import tree from "./tree";
import mail from "./mail";
import payment from "./payments";
import upgrade from "./upgrade";
import crm from "./crm";
import lcp from "./lcp";
import replica from "./replica";
import ticket from "./ticket";
import donation from "./donation";
import replicaRegister from "./replicaRegister";
import party from "./party";
import order from "./order";
import usdtWallet from "./usdtWallet";
import bebWallet from "./bebWallet";
import mobile from "./mobile";

// export default {
//   signup,
//   report,
//   packages,
//   epin,
//   ewallet,
//   home,
//   payout,
//   common,
//   authAccess,
//   profile,
//   tools,
//   tree,
//   mail,
//   payment,
//   upgrade,
//   crm,
//   lcp,
//   replica,
//   payment,
//   ticket,
//   donation,
//   replicaRegister,
//   party,
//   order,
//   usdtWallet,
//   bebWallet,
//   mobile,
// };
export default (app) => {
  app.use("/api/app/payout", auth, payout);
  app.use("/api/app/common", common);
  app.use("/api/app/auth", authAccess);
  app.use(
    "/api/app/profile",
    async (req, res, next) => {
      console.log("==================called inside of profile==============");
      return next();
    },
    auth,
    profile
  );
  app.use("/api/app/home", auth, home);
  app.use("/api/app/ewallet", auth, ewallet);
  app.use("/api/app/epin", auth, epin);
  app.use("/api/app/package", auth, packages);
  app.use("/api/app/report", auth, report);
  app.use("/api/app/api_register", auth, signup);
  app.use("/api/app/tools", auth, tools);
  app.use("/api/app/tree", auth, tree);
  app.use("/api/app/mail", auth, mail);
  app.use("/api/app/ticket", auth, ticket);
  app.use("/api/app/payment", auth, payment);
  app.use("/api/app/upgrade", auth, upgrade);
  app.use("/api/app/crm", auth, crm);
  app.use("/api/app/lcp", lcp);
  app.use("/api/app/replica", replica);
  app.use("/api/app/donation", auth, donation);
  app.use("/api/app/replica_register", replicaRegister);
  app.use("/api/app/party", auth, party);
  app.use("/api/app/order", auth, order);

  // app.use("/api/app/usdtWallet", auth, usdtWallet);
  app.use("/api/app/bebWallet", auth, bebWallet);
  app.use("/api/app/mobile", auth, mobile);
};
