require('../config/dataBase')
const mongoose = require('mongoose')
const { allowedTypes } = require('../utils/validateUtils')

const occasionSchema = new mongoose.Schema({

    createdat: { type: Date, default: Date.now() },
    updatedat: { type: Date, default: Date.now() },
    occassionat: { type: Date, default: Date.now() },
    name: { type: String, default: '' },
    type: { type: Object, enum: allowedTypes },

}, { collection : "occasions" });

module.exports = mongoose.model('occasions', occasionSchema);  