const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    title: { type: String, default: '', maxlength: 120 },
    location: { type: String, default: '', maxlength: 120 },
    targetRole: { type: String, default: '' },
  },
  { timestamps: true }
);

userSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.createWithPassword = async function createWithPassword(data) {
  const passwordHash = await bcrypt.hash(data.password, 12);
  return this.create({ ...data, passwordHash });
};

module.exports = mongoose.model('User', userSchema);
