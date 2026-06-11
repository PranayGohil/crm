import mongoose from "mongoose";
import dns from "dns";

// Some routers/ISP DNS servers refuse the SRV/TXT lookups that the
// `mongodb+srv://` connection string requires, which surfaces as
// `querySrv ECONNREFUSED`. Force Node's resolver to use public DNS so the
// Atlas SRV record can always be resolved.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectUrl = process.env.MONGODB_URI;

// Designations/Departments moved from globally-unique names to per-owner unique
// (each Child Admin has its own set). Drop the legacy `name_1` unique index so
// two admins can reuse the same name. Safe to run on every boot (ignores if absent).
const dropLegacyUniqueIndexes = async () => {
    for (const coll of ["designations", "departments"]) {
        try {
            await mongoose.connection.collection(coll).dropIndex("name_1");
            console.log(`dropped legacy ${coll}.name_1 index`);
        } catch (e) {
            // index already gone / never existed — ignore
        }
    }
};

const connectDB = async () => {
    try {
        await mongoose.connect(connectUrl);
        console.log("database connected");
        await dropLegacyUniqueIndexes();
    } catch (error) {
        console.error("database connection failed", error);
        // Don't hard-exit on a transient connection error — let nodemon keep
        // the process alive and retry instead of killing the API server.
        setTimeout(connectDB, 5000);
    }
};

export default connectDB;
