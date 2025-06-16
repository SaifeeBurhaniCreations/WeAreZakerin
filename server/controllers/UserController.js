const router = require('express').Router();
const { validatePassword, hashPassword } = require('../utils/auth');
const userClient = require('../models/users')
const groupClient = require('../models/group')
const jwt = require('jsonwebtoken')
const { allowedRoles, roles_for_group } = require('../utils/validateUtils'); // Import allowed roles
require('dotenv').config()

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization token is required.' });
    }

    const token = authHeader && authHeader.split(" ")[1].trim();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Assuming you have a JWT_SECRET in your .env
        const { userid } = decoded; // Attach user info to request
        const user = await userClient.findOne({ userid })
        req.user = user
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token.' });
    }
};


router.get('/me', authenticate, async (req, res) => {

    try {
        const user = req.user
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user details:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

router.get('/', authenticate, async (req, res) => {
    try {
        const users = await userClient.find();
        // const filteredUsers = users.filter(user => user?._id.toString() !== req.user._id.toString());

        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching user count:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

router.get('/fetch/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params
        const user = await userClient.findOne({ _id: id });
        return res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user count:", error);
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

router.delete('/remove/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    const creator = req.user

    // Check if the creator has permission to create a new user
    if (!roles_for_group.includes(creator.role) || (creator.role === 'member' && req.body.role !== 'member')) {
        return res.status(403).json({ error: "You do not have permission to create this user." });
    }

    try {

        // Find the user by ID param
        const user = await userClient.findOne({ userid: id });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Check if the user belongs to a group
        if (user?.belongsto !== '') {
            const group = await groupClient.findOne({ name: user?.belongsto });

            if (group) {
                // Remove user from members array
                await groupClient.updateOne(
                    { name: user?.belongsto },
                    { $pull: { members: user?._id } }
                );
            }
        }

        // Delete the user
        const result = await userClient.deleteOne({ userid: id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "User deletion failed." });
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

    const ITS = Number(userid)

    try {
        const response_login_find = await userClient.findOne({ userid: ITS });

        if (!response_login_find) {
            return res.status(401).json({ error: "Username or password is not valid." });
        }
        
        const user = response_login_find;

        if (typeof userpass !== 'string' || typeof user[0].userpass !== 'string') {
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

router.post('/create', authenticate, async (req, res) => {

    try {

        const creator = req.user

        // Check if the creator has permission to create a new user
        if (!roles_for_group.includes(creator.role) || (creator.role === 'member' && req.body.role !== 'member')) {
            return res.status(403).json({ error: "You do not have permission to create this user." });
        }

        // Validate uniqueness of fullname, email, phone, and userid
        const { fullname, phone, userid, belongsto } = req.body;
        const existingUser = await userClient.findOne({ $or: [{ fullname }, { phone }, { userid }] });

        if (existingUser) {
            return res.status(400).json({ error: "User with the same fullname, email, phone, or userid already exists." });
        }

        const isGroupExist = await groupClient.findOne({ name: belongsto })
        if (!isGroupExist) {
            return res.status(400).json({ error: "Group dosen't exists." });
        }

        const hasedPass = await hashPassword(String(userid))
        // Create the new user
        const newUser = new userClient({
            ...req.body, // Spread the request body to create the user
            userpass: hasedPass,
            createdat: Date.now(),
            updatedat: Date.now(),
        });

        await newUser.save(); // Save the new user to the database
        await groupClient.updateOne({ name: belongsto }, { $push: { members: newUser?._id } })
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