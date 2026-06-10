// scripts/diagnoseAdmin.js
// Diagnostic: lists admins + their business_types, and round-trips a save on a
// target admin to prove persistence works (same path updateAdmin uses).
//   node scripts/diagnoseAdmin.js                 -> list all admins
//   node scripts/diagnoseAdmin.js test <email>    -> set business_types=['Mukhwas'] then read back
import mongoose from "mongoose";
import dns from "dns";
import Admin from "../models/adminModel.js";
import dotenv from "dotenv";

dotenv.config();

// Same DNS workaround as config/db.js so the Atlas SRV record resolves.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("DB connected\n");

  const admins = await Admin.find().select("username email role business_types sales_permissions manage_stages");
  console.log("=== Current admins ===");
  admins.forEach((a) => {
    console.log(`- ${a.username} <${a.email}> [${a.role}]`);
    console.log(`    business_types : ${JSON.stringify(a.business_types)}`);
    console.log(`    sales_perms    : ${JSON.stringify(a.sales_permissions)}`);
    console.log(`    manage_stages  : ${JSON.stringify(a.manage_stages)}`);
  });

  const [, , cmd, email] = process.argv;
  if (cmd === "test" && email) {
    console.log(`\n=== Round-trip test on ${email} ===`);
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log("  NOT FOUND");
    } else {
      admin.business_types = ["Mukhwas"]; // same assignment updateAdmin does
      await admin.save();
      const reread = await Admin.findOne({ email }).select("business_types sales_permissions manage_stages");
      console.log("  after save -> business_types:", JSON.stringify(reread.business_types));
      console.log("  after save -> sales_perms   :", JSON.stringify(reread.sales_permissions));
      console.log("  after save -> manage_stages :", JSON.stringify(reread.manage_stages));
      console.log(reread.business_types?.includes("Mukhwas") ? "  RESULT: ✅ persisted" : "  RESULT: ❌ NOT persisted");
    }
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((e) => {
  console.error("Diagnostic failed:", e.message);
  process.exit(1);
});
