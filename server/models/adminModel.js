// models/Admin.js
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: String,
  profile_pic: String,
  profile_pic_public_id: String,
  role: {
    type: String,
    enum: ['super-admin', 'admin'],
    default: 'admin'
  },
  // Business types this admin can access. Master field that drives panel
  // visibility. 'Maulshree' = the main CRM (projects/clients/employees/etc.),
  // 'Mukhwas'/'Breeliq' = sales-only panels.
  business_types: [{
    type: String,
    enum: ['Maulshree', 'Mukhwas', 'Breeliq'],
    default: []
  }],
  // Derived from business_types (see pre-save hook). Kept for backward
  // compatibility with existing sales middleware / token / SalesPanel logic.
  sales_permissions: [{
    type: String,
    enum: ['manage_mukhwas_sales', 'manage_breeliq_sales'],
    default: []
  }],
  // Maulshree project stages this admin can manage. Only meaningful when
  // business_types includes 'Maulshree' (cleared otherwise by the hook).
  manage_stages: [{
    type: String,
    default: []
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps + derive sales_permissions from business_types on save
adminSchema.pre('save', function (next) {
  this.updatedAt = Date.now();

  const types = this.business_types || [];

  // Derive sales_permissions so existing sales code keeps working unchanged.
  const derived = [];
  if (types.includes('Mukhwas')) derived.push('manage_mukhwas_sales');
  if (types.includes('Breeliq')) derived.push('manage_breeliq_sales');
  this.sales_permissions = derived;

  // Stages are meaningless without Maulshree access.
  if (!types.includes('Maulshree')) {
    this.manage_stages = [];
  }

  next();
});

export default mongoose.model("Admin", adminSchema);