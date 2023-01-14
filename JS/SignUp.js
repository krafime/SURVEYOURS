const bcrypt = require("bcrypt");
const saltRounds = 10;

class SignUp {
  constructor(username, email, password) {
    this._username = username;
    this._email = email;
    this._password = password;
  }

  get username() {
    return this._username;
  }

  set username(newUsername) {
    this._username = newUsername;
  }

  get email() {
    return this._email;
  }

  set email(newEmail) {
    this._email = newEmail;
  }

  get password() {
    return this._password;
  }

  set password(newPassword) {
    this._password = newPassword;
  }

  registerUser(req, res, User) {
    if (!/^[a-zA-Z0-9]{8,}$/.test(this._password)) {
      // password does not meet requirements, display error message
      res.render("SignUp_Screen_err", {
        error: "Password must be at least 8 alphanumeric characters",
      });
    } else {
      User.findOne(
        {
          $or: [{ username: this._username }, { email: this._email }],
        },
        (err, foundUser) => {
          if (err) {
            console.log(err);
          } else {
            if (foundUser) {
              // check if the username or email is already in use
              if (foundUser.username === this._username) {
                // username already in use, display error message
                res.render("SignUp_Screen_err", {
                  error: "Username already in use",
                });
              } else {
                // email already in use, display error message
                res.render("SignUp_Screen_err", {
                  error: "Email already in use",
                });
              }
            } else {
              // username and email not in use, create new user
              bcrypt.hash(this._password, saltRounds, (err, hash) => {
                const newUser = new User({
                  username: this._username,
                  email: this._email,
                  password: hash,
                });
                newUser.save((err) => {
                  if (!err) {
                    res.redirect("/login");
                  } else {
                    console.log(err);
                  }
                });
              });
            }
          }
        }
      );
    }
  }
}
module.exports = SignUp;
