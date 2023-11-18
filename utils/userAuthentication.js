const jwt = require("jsonwebtoken");
const argon2 = require("argon2");

// Assuming you have a User model
const User = require("../models/user");

const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization;

  

  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Token missing." });
  }

  try {
    // Verify the token
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findById(decodedToken.user.id);


    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Invalid user." });
    }

    const isPasswordValid =
      user.password.trim() === decodedToken.user.password.trim();

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "Unauthorized. Password is not valid." });
    }

    req.user = {
      _id: user._id,
      username: user.username,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized. Invalid token." });
  }
};

module.exports = authenticateUser;
