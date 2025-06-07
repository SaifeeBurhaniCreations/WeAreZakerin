const router = require('express').Router();
const { validatePassword } = require('../utils/auth');
const groupClient = require('../models/group')
const userClient = require('../models/users')
const jwt = require('jsonwebtoken')
const { roles_for_group: allowedRoles } = require('../utils/validateUtils');
require('dotenv').config()

// Middleware to check for token and extract user role
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Assuming you have a JWT_SECRET in your .env
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token.' });
    }
};

// Create Group Route
router.post('/create', authenticate, async (req, res) => {
    const { name, adminId, userDetails } = req.body;
    const creatorRole = req.user.role; // Get role from decoded token

    // Check if the requester has the right role
    if (!allowedRoles.includes(creatorRole)) {
        return res.status(403).json({ message: 'Access denied. Only authorized roles can create a group.' });
    }

    // Check if the group already has an admin
    const existingGroup = await groupClient.findOne({ name });
    if (existingGroup && existingGroup.admin) {
        return res.status(400).json({ message: 'Group already has an admin.' });
    }

    let groupAdmin;

    // Determine how to assign the group admin
    if (adminId) {
        const adminUser = await userClient.findById(adminId);
        if (!adminUser || !allowedRoles.includes(adminUser.role)) {
            return res.status(400).json({ message: 'Invalid admin ID. Must be an existing user with a valid role.' });
        }
        groupAdmin = adminId;
    } else if (userDetails) {
        const newUser = await userClient.create(userDetails);
        groupAdmin = newUser._id;
    } else {
        return res.status(400).json({ message: 'Either adminId or userDetails must be provided.' });
    }

    // Create the group
    const newGroup = await groupClient.create({
        name,
        admin: groupAdmin,
        members: [],
    });

    return res.status(201).json(newGroup);
});

// Update Group Route
router.put('/update/:groupId', authenticate, async (req, res) => {
    const { groupId } = req.params;
    const { name } = req.body;
    const creatorRole = req.user.role; // Get role from decoded token
    const group = await groupClient.findById(groupId);

    if (!group) {
        return res.status(404).json({ message: 'Group not found.' });
    }

    if (!allowedRoles.includes(creatorRole) && group.admin !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. Only authorized roles or the assigned groupadmin can update this group.' });
    }

    group.name = name || group.name;
    await group.save();

    return res.status(200).json(group);
});

// Delete Group Route
router.delete('/remove/:groupId', authenticate, async (req, res) => {
    const { groupId } = req.params;
    const creatorRole = req.user.role; // Get role from decoded token

    if (!allowedRoles.includes(creatorRole)) {
        return res.status(403).json({ message: 'Access denied. Only authorized roles can delete this group.' });
    }

    const group = await groupClient.findByIdAndDelete(groupId);
    if (!group) {
        return res.status(404).json({ message: 'Group not found.' });
    }

    return res.status(204).send();
});

// Transfer Group Admin Rights Route
router.post('/:groupId/transfer/role', authenticate, async (req, res) => {
    const { groupId } = req.params;
    const { newAdminId } = req.body;
    const creatorRole = req.user.role; // Get role from decoded token
    const group = await groupClient.findById(groupId);

    if (!group) {
        return res.status(404).json({ message: 'Group not found.' });
    }

    if (group.admin !== req.user.id && !allowedRoles.includes(creatorRole)) {
        return res.status(403).json({ message: 'Access denied. Only the current groupadmin or authorized roles can transfer rights.' });
    }

    const newAdminUser = await userClient.findById(newAdminId);
    if (!newAdminUser || !allowedRoles.includes(newAdminUser.role) || newAdminUser.role === 'superadmin') {
        return res.status(400).json({ message: 'Invalid new admin ID. Must be an existing user with a valid role.' });
    }

    // Change the old group admin's role to 'member'
    const oldAdminUser = await userClient.findById(group.admin);
    if (oldAdminUser) {
        oldAdminUser.role = 'member'; // Update the old admin's role
        await oldAdminUser.save(); // Save the changes
    }

    // Assign the new admin
    group.admin = newAdminId;
    await group.save();

    return res.status(200).json(group);
});

// Assign External User to Group Route
router.post('/:groupId/add/user', authenticate, async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    const creatorRole = req.user.role; // Get role from decoded token

    if (!allowedRoles.includes(creatorRole)) {
        return res.status(403).json({ message: 'Access denied. Only authorized roles can add members to this group.' });
    }

    const group = await groupClient.findById(groupId);

    if (!group) {
        return res.status(404).json({ message: 'Group not found.' });
    }

    if (group.members.includes(userId)) {
        return res.status(400).json({ message: 'User is already a member of this group.' });
    }

    const user = await userClient.findById(userId);
    if (!user || !['admin', 'groupadmin', 'member'].includes(user.role)) {
        return res.status(400).json({ message: 'Invalid user ID. Must be an existing user with role admin, groupadmin, or member.' });
    }

    if (group.admin && user.role === 'groupadmin') {
        return res.status(400).json({ message: 'Cannot assign groupadmin if the group already has one.' });
    }

    group.members.push(userId);
    user.belongsto = group.name;
    await user.save();
    await group.save();

    return res.status(200).json(group);
});

// New route to transfer a user from one group to another
router.post('/:groupId/transfer/user', authenticate, async (req, res) => {
    const { groupId } = req.params;
    const { userId, newGroupId } = req.body;
    const creatorRole = req.user.role; // Get role from decoded token

    if (!allowedRoles.includes(creatorRole)) {
        return res.status(403).json({ message: 'Access denied. Only authorized roles can transfer members.' });
    }

    const group = await groupClient.findById(groupId);
    const newGroup = await groupClient.findById(newGroupId);
    const user = await userClient.findById(userId);

    if (!group || !newGroup) {
        return res.status(404).json({ message: 'Group not found.' });
    }

    if (!user || !group.members.includes(userId)) {
        return res.status(400).json({ message: 'User is not a member of this group.' });
    }

    // Remove user from the current group
    group.members = group.members.filter(member => member.toString() !== userId);
    await group.save();

    // Add user to the new group
    newGroup.members.push(userId);
    user.belongsto = newGroup.name;
    await user.save();
    await newGroup.save();

    return res.status(200).json(newGroup);
});

// New route to remove a user from a group
router.delete('/:groupId/remove/user', authenticate, async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    const creatorRole = req.user.role; // Get role from decoded token

    if (!allowedRoles.includes(creatorRole)) {
        return res.status(403).json({ message: 'Access denied. Only authorized roles can remove members from this group.' });
    }

    const group = await groupClient.findById(groupId);
    const user = await userClient.findById(userId);

    if (!group) {
        return res.status(404).json({ message: 'Group not found.' });
    }

    if (!user || !group.members.includes(userId)) {
        return res.status(400).json({ message: 'User is not a member of this group.' });
    }

    // Remove user from the group
    group.members = group.members.filter(member => member.toString() !== userId);
    user.belongsto = null;
    await user.save();
    await group.save();

    return res.status(204).send();
});

module.exports = router;
