const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")


function initialize(passport, User){
    // Function to authenticate users
    const authenticateUsers = async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'البريد الالكتروني المدخل غير صحيح' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'الرقم السري المدخل غير صحيح' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }

    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUsers))
     
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  
}


module.exports = initialize
