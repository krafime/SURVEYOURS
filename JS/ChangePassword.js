const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

class ChangePassword {
  constructor(email, password, newPassword) {
    this._email = email;
    this._password = password;
    this._newPassword = newPassword;
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

  get newPassword() {
    return this._newPassword;
  }

  set newPassword(newNewPassword) {
    this._newPassword = newNewPassword;
  }

  async changePassword(req, res, User) {
    try {
      const foundUser = await User.findOne({ email: this._email });
      if (foundUser) {
        const isMatch = await bcrypt.compare(
          this._password,
          foundUser.password
        );
        if (isMatch) {
          if (
            /^[a-zA-Z0-9]{8,}$/.test(this._newPassword) &&
            this._newPassword.length >= 8
          ) {
            const hashedPassword = await bcrypt.hash(this._newPassword, 10);
            await User.updateOne(
              { email: this._email },
              { $set: { password: hashedPassword } }
            );
            res.redirect("/login");
          } else {
            res.render("Change_Screen_err", {
              error: "Password must be at least 8 alphanumeric characters",
            });
          }
        } else {
          res.render("Change_Screen_err", { error: "Wrong Old Password" });
        }
      } else {
        res.render("Change_Screen_err", { error: "Email not found" });
      }
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = ChangePassword;
