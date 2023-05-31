import auth from "../../middleware/web/auth";
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
// };

export default (app) => {
  app.use("/api/web/payout", auth, payout);
  app.use("/api/web/common", common);
  app.use("/api/web/auth", authAccess);
  app.use("/api/web/profile", auth, profile);
  app.use("/api/web/home", auth, home);
  app.use("/api/web/ewallet", auth, ewallet);
  app.use("/api/web/epin", auth, epin);
  app.use("/api/web/package", auth, packages);
  app.use("/api/web/report", auth, report);
  app.use("/api/web/api_register", auth, signup);
  app.use("/api/web/tools", auth, tools);
  app.use("/api/web/tree", auth, tree);
  app.use("/api/web/mail", auth, mail);
  app.use("/api/web/ticket", auth, ticket);
  app.use("/api/web/payment", auth, payment);
  app.use("/api/web/upgrade", auth, upgrade);
  app.use("/api/web/crm", auth, crm);
  app.use("/api/web/lcp", lcp);
  app.use("/api/web/replica", replica);
  app.use("/api/web/donation", auth, donation);
  app.use("/api/web/replica_register", replicaRegister);
  app.use("/api/web/party", auth, party);
  app.use("/api/web/order", auth, order);

  app.use("/api/web/usdtWallet", auth, usdtWallet);
  app.use("/api/web/bebWallet", auth, bebWallet);
};