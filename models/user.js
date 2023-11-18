const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
 username: { type: String, required: true, unique: true },
 password: { type: String, required: true },
});

UserSchema.methods.encryptPassword = async (password) => {
 const salt = await bcrypt.genSalt(10);
 return await bcrypt.hash(password, salt);
};

UserSchema.methods.comparePassword = function (password) {
 return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);