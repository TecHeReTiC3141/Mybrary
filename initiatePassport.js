const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

async function initializePassport(passport, getUserByEmail, getUserById) {

    const authenticateUser = async (email, password, done) => {
        const user = await getUserByEmail(email);
        if (!user) {
            return done(null, false, { message: 'No user with such email' });
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            }
            return done(null, false, { message: "Passwords don't match"});
        } catch (err) {
            return done(err);
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.ID));
    passport.deserializeUser((id, done) => done(null, getUserById(id)));
}

module.exports = initializePassport;