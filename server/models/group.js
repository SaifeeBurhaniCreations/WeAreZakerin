require('../config/dataBase')
const mongoose = require('mongoose')
const { allowedTypes } = require('../utils/validateUtils')

const groupSchema = new mongoose.Schema({

    name: { type: String, default: '' },
    admin: { type: String, default: '' },
    members: { types: Array, default: [] },
    createdat: { type: Date, default: Date.now() },
    updatedat: { type: Date, default: Date.now() },

}, { collection : "groups" });

module.exports = mongoose.model('groups', groupSchema);  