const Log = require("../models/log");

async function logAction(req, action, description = "") {
    try {
        const entry = new Log({
            userId: req.user.pseudo,        // vient du JWT
            action,
            description,
            userAgent: req.headers["user-agent"]
        });

        await entry.save();
    } catch (err) {
        console.error("Erreur log:", err);
    }
}

module.exports = logAction;
