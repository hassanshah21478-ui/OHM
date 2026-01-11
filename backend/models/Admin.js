const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, default: "Hassan" },
  uId: { type: String, required: true, default: "14539" },
  email: { type: String, required: true, unique: true, default: "hassanshah21478@gmail.com" },
  designation: { type: String, default: "Student" },
  area: { type: String, default: "DHA PHASE 1" },
  profilePic: { type: String, default: "/proLogo.png" }, 
  password: { type: String, required: true },
});

module.exports = mongoose.model('Admin', adminSchema);
