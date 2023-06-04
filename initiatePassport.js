const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

async function initializePassport(passport, getUserByEmail, getUserById) {

    const authenticateUser = async (email, password, done) => {
        const user = await getUserByEmail(email);
        if (user === null) {
            return done(null, false, { message: 'No user with such email' });
        }
    }
}

module.exports = initializePassport;