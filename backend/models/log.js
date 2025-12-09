const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    action: { type: String, required: true },
    description: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);
