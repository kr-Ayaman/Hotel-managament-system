const guestAuth = require('./guestAuth');
const staffAuth = require('./staffAuth');

const guestOrStaffAuth = (req, res, next) => {
    guestAuth(req, res, (err) => {
        if (!err) {
            return next();
        }
        staffAuth(req, res, (err) => {
            if (!err) {
                return next();
            }
            res.status(401).json({ error: 'Unauthorized access' });
        });
    });
};

module.exports = guestOrStaffAuth;
