const router = require('express').Router();
const { validatePassword } = require('../utils/auth');
const occasionClient = require('../models/occasion')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from header
    if (!token) {
        return res.status(401).json({ error: "Token is required." });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userid; // Store user ID for later use
        next();
    } catch (error) {
        console.error("Token verification failed:", error);
        return res.status(403).json({ error: "Invalid token." });
    }
};

router.post('/create', verifyToken, async (req, res) => {
    try {
        const { name, type, occassionat } = req.body;
        const newOccasion = new occasionClient({
            name,
            type,
            occassionat,
            createdat: Date.now(),
            updatedat: Date.now(),
        });
        await newOccasion.save();
        return res.status(201).json({ message: "Occasion created successfully.", occasion: newOccasion });
    } catch (error) {
        console.error("Error creating occasion:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

router.put('/update/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const occasionToUpdate = await occasionClient.findById(id);
        if (!occasionToUpdate) {
            return res.status(404).json({ error: "Occasion not found." });
        }

        Object.assign(occasionToUpdate, req.body);
        occasionToUpdate.updatedat = Date.now();
        await occasionToUpdate.save();
        return res.status(200).json({ message: "Occasion updated successfully.", occasion: occasionToUpdate });
    } catch (error) {
        console.error("Error updating occasion:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

router.delete('/remove/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await occasionClient.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Occasion not found." });
        }
        return res.status(200).json({ message: "Occasion deleted successfully." });
    } catch (error) {
        console.error("Error deleting occasion:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

router.get('/fetch/all', async (req, res) => {
    try {
        const occasions = await occasionClient.find();
        return res.status(200).json({ occasions });
    } catch (error) {
        console.error("Error fetching occasions:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

router.get('/fetch/date/:date', async (req, res) => {
    const { date } = req.params;
    try {
        const occasions = await occasionClient.find({ occassionat: { $eq: new Date(date) } });
        return res.status(200).json({ occasions });
    } catch (error) {
        console.error("Error fetching occasions by date:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

router.get('/fetch/month/:month', async (req, res) => {
    const { month } = req.params;
    try {
        const occasions = await occasionClient.find({ occassionat: { $regex: new RegExp(`^${month}`) } });
        return res.status(200).json({ occasions });
    } catch (error) {
        console.error("Error fetching occasions by month:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

router.get('/fetch/year/:year', async (req, res) => {
    const { year } = req.params;
    try {
        const occasions = await occasionClient.find({ occassionat: { $regex: new RegExp(`^${year}`) } });
        return res.status(200).json({ occasions });
    } catch (error) {
        console.error("Error fetching occasions by year:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

router.get('/fetch/group/:group', async (req, res) => {
    const { group } = req.params;
    try {
        const occasions = await occasionClient.find({ group });
        return res.status(200).json({ occasions });
    } catch (error) {
        console.error("Error fetching occasions by group:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;