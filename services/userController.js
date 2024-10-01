// services/userController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const collection = require('../src/mongodb'); // Adjust path if necessary

const SECRET_KEY = 'your-secret-key'; // Change to a secure key

async function signup(req, res) {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const data = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName,
            password: hashedPassword
        };

        await collection.create(data);
        res.redirect("/"); // Redirect to login after successful signup
    } catch (error) {
        console.error(error);
        res.status(500).send("Error occurred while signing up");
    }
}

async function login(req, res) {
    try {
        const user = await collection.findOne({ userName: req.body.userName });
        if (!user) {
            return res.status(400).send("User not found");
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send("Invalid credentials");
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
        
        res.json({ token }); // Send token back to client
    } catch (error) {
        console.error(error);
        res.status(500).send("Error occurred while logging in");
    }
}

module.exports = {
    signup,
    login
};
