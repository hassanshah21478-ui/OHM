const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

(async () => {
  const hashed = await bcrypt.hash("hassan14539", 10);
  await Admin.create({ email: "hassanshah21478@gmail.com", password: hashed });
  console.log("Admin created");
  process.exit();
})();
