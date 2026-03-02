// scripts/createSuperAdmin.js
import mongoose from "mongoose";
import Admin from "../models/adminModel.js";
import dotenv from "dotenv";

dotenv.config();

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const superAdminData = {
            username: "superadmin",
            email: "superadmin@example.com",
            password: "SuperAdmin@123",
            phone: "1234567890",
            role: "super-admin",
            isActive: true
        };

        // Check if super admin already exists
        const existingSuperAdmin = await Admin.findOne({
            role: "super-admin"
        });

        if (existingSuperAdmin) {
            console.log("Super admin already exists!");
            console.log("Email:", existingSuperAdmin.email);
            process.exit(0);
        }

        const superAdmin = new Admin(superAdminData);
        await superAdmin.save();

        console.log("Super admin created successfully!");
        console.log("Email:", superAdminData.email);
        console.log("Password: SuperAdmin@123");

    } catch (error) {
        console.error("Error creating super admin:", error);
    } finally {
        mongoose.disconnect();
    }
};

createSuperAdmin();