const router = require('express').Router();
const { validatePassword } = require('../utils/auth');
const userClient = require('../models/users')
const jwt = require('jsonwebtoken')
const { allowedRoles } = require('../utils/validateUtils'); // Import allowed roles
require('dotenv').config()

router.get('/me', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from header
    if (!token) {
        return res.status(401).json({ error: "Token is required." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userClient.findOne({ userid: decoded.userid });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user details:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

router.get('/count', async (req, res) => {
    try {
        const count = await userClient.countDocuments(); // Get total user count
        return res.status(200).json({ count });
    } catch (error) {
        console.error("Error fetching user count:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

router.get('/count/:group', async (req, res) => {
    const { group } = req.params; // Get the group from the request parameters
    try {
        const count = await userClient.countDocuments({ belongsto: group }); // Count users belonging to the specified group
        return res.status(200).json({ count });
    } catch (error) {
        console.error("Error fetching user count:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

router.delete('/remove', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from header
    if (!token) {
        return res.status(401).json({ error: "Token is required." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await userClient.deleteOne({ userid: decoded.userid });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "User not found." });
        }
        return res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

router.post("/authentication/login", async (req, res) => {
    let { userid, userpass } = req.body;

    if (!userid || !userpass) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    try {
        const response_login_find = await userClient.findOne({ userid });
        if (!response_login_find) {
            return res.status(401).json({ error: "Username or password is not valid." });
        }

        const user = response_login_find;

        if (typeof userpass !== 'string' || typeof user.userpass !== 'string') {
            return res.status(400).json({ error: "Invalid password format" });
        }

        const passwordMatch = await validatePassword(userpass, user.userpass);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Username or password is not valid." });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined in environment variables.");
            return res.status(500).json({ error: "Server configuration error." });
        }
        const token = jwt.sign({ userid: user.userid }, process.env.JWT_SECRET);
        return res.status(200).json({ token });
    } catch (error) {
        console.error("Error during authentication:", error);
        return res.status(500).json({ error: "Internal server error, please try again later." });
    }
});

router.post('/create', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from header
    if (!token) {
        return res.status(401).json({ error: "Token is required." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const creator = await userClient.findOne({ userid: decoded.userid }); // Find the creator's details
        if (!creator) {
            return res.status(404).json({ error: "Creator not found." });
        }

        // Check if the creator has permission to create a new user
        if (!allowedRoles.includes(creator.role) || (creator.role === 'member' && req.body.role !== 'member')) {
            return res.status(403).json({ error: "You do not have permission to create this user." });
        }

        // Validate uniqueness of fullname, email, phone, and userid
        const { fullname, email, phone, userid } = req.body;
        const existingUser = await userClient.findOne({ $or: [{ fullname }, { email }, { phone }, { userid }] });
        if (existingUser) {
            return res.status(400).json({ error: "User with the same fullname, email, phone, or userid already exists." });
        }

        // Create the new user
        const newUser = new userClient({
            ...req.body, // Spread the request body to create the user
            createdat: Date.now(),
            updatedat: Date.now(),
        });

        await newUser.save(); // Save the new user to the database
        return res.status(201).json({ message: "User created successfully.", user: newUser });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

router.put('/update/:userid', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from header
    if (!token) {
        return res.status(401).json({ error: "Token is required." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const updater = await userClient.findOne({ userid: decoded.userid }); // Find the updater's details
        if (!updater) {
            return res.status(404).json({ error: "Updater not found." });
        }

        // Check if the updater has permission to update the user
        if (!allowedRoles.includes(updater.role)) {
            return res.status(403).json({ error: "You do not have permission to update this user." });
        }

        const { userid } = req.params; // Get the userid from the request parameters
        const userToUpdate = await userClient.findOne({ userid }); // Find the user to update
        if (!userToUpdate) {
            return res.status(404).json({ error: "User not found." });
        }

        // Validate uniqueness of fullname, email, phone, and userid
        const { fullname, email, phone } = req.body;
        const existingUser = await userClient.findOne({
            $or: [
                { fullname, userid: { $ne: userid } },
                { email, userid: { $ne: userid } },
                { phone, userid: { $ne: userid } }
            ]
        });
        if (existingUser) {
            return res.status(400).json({ error: "User with the same fullname, email, or phone already exists." });
        }

        // Update the user with the provided data
        Object.assign(userToUpdate, req.body); // Update user fields with request body
        userToUpdate.updatedat = Date.now(); // Update the timestamp

        await userToUpdate.save(); // Save the updated user to the database
        return res.status(200).json({ message: "User updated successfully.", user: userToUpdate });
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router