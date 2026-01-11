const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");

// Get admin info
exports.getAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOne().select("-password");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.json({
      success: true,
      message: "Admin data fetched successfully",
      admin: {
        ...admin.toObject(),
        profilePic: "/proLogo.png", // ALWAYS return fixed logo
      },
    });
  } catch (err) {
    console.error("Error in getAdmin:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify password
exports.verifyPassword = async (req, res) => {
  const { password } = req.body;
  try {
    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Wrong password" });
    }

    res.json({ success: true, message: "Password correct" });
  } catch (err) {
    console.error("Error verifying password:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update admin info
exports.updateAdmin = async (req, res) => {
  try {
    console.log("📝 Update request received:", req.body); // Debug log
    
    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const updateFields = {};
    const { name, uId, email, designation, area } = req.body;

    // Validate and add fields
    if (name && name.trim()) updateFields.name = name.trim();
    if (uId && uId.trim()) updateFields.uId = uId.trim();
    if (designation && designation.trim()) updateFields.designation = designation.trim();
    if (area && area.trim()) updateFields.area = area.trim();

    // Handle email separately (check for duplicates)
    if (email && email.trim()) {
      if (email !== admin.email) {
        const existing = await Admin.findOne({ email: email.trim() });
        if (existing) {
          return res.status(400).json({ 
            success: false, 
            message: "Email already in use" 
          });
        }
        updateFields.email = email.trim();
      }
    }

    // NO profilePic handling - we're using fixed logo
    // Remove any file upload logic
    
    // Update the admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      admin._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    // ALWAYS return proLogo.png as profilePic
    const adminResponse = {
      name: updatedAdmin.name,
      uId: updatedAdmin.uId,
      email: updatedAdmin.email,
      designation: updatedAdmin.designation,
      area: updatedAdmin.area,
      profilePic: "/proLogo.png", // Fixed logo always
    };

    res.json({
      success: true,
      message: "Admin updated successfully",
      admin: adminResponse,
    });
  } catch (err) {
    console.error("❌ Error updating admin:", err.message);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: "Validation error: " + err.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Server error while updating" 
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Wrong password" });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error changing password:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};