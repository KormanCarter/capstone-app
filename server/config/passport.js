// config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const pool = require('./database');

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = result.rows[0];
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy for email/password authentication
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    // Find user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return done(null, false, { message: 'No user found with that email' });
    }

    // Check if user has a password (not OAuth only)
    if (!user.password) {
      return done(null, false, { message: 'Please log in with Google' });
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return done(null, false, { message: 'Incorrect password' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const port = process.env.PORT || 3001;
  const serverBaseUrl = (process.env.SERVER_URL || `http://localhost:${port}`).replace(/\/$/, '');
  const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL || `${serverBaseUrl}/auth/google/callback`;

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: googleCallbackUrl,
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let result = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);
      let user = result.rows[0];

      if (user) {
        return done(null, user);
      }

      // Check if user exists with same email
      result = await pool.query('SELECT * FROM users WHERE email = $1', [profile.emails[0].value]);
      user = result.rows[0];

      if (user) {
        // Link Google account to existing user
        await pool.query(
          'UPDATE users SET google_id = $1 WHERE id = $2',
          [profile.id, user.id]
        );
        user.google_id = profile.id;
        return done(null, user);
      }

      // Create new user
      const newUser = await pool.query(
        'INSERT INTO users (email, name, google_id) VALUES ($1, $2, $3) RETURNING *',
        [profile.emails[0].value, profile.displayName, profile.id]
      );

      return done(null, newUser.rows[0]);
    } catch (error) {
      return done(error);
    }
  }));
}

module.exports = passport;