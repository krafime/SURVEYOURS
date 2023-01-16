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

class SignIn {
    constructor(username, password) {
      this._username = username;
      this._password = password;
    }
  
    checkCredentials() {
      let isValid = true;
      const usernameEl = document.getElementById("InputName");
      const passwordEl = document.getElementById("InputPassword1");
      if (!usernameEl || !passwordEl) {
        isValid = false;
      } else {
        if (usernameEl.value === "") {
          document.getElementById("nameErr").innerHTML = "Enter Username";
          isValid = false;
        } else {
          document.getElementById("nameErr").innerHTML = "";
        }
        if (passwordEl.value === "") {
          document.getElementById("passErr").innerHTML = "Enter Password";
          isValid = false;
        } else {
          document.getElementById("passErr").innerHTML = "";
        }
      }
  
      return isValid;
    }
  
    async validate() {
      try {
        if (this.checkCredentials()) {
          // check if the credentials are valid
          // Hash the entered password
          const hashedPassword = await bcrypt.hash(this._password, saltRounds);
          // Compare the hashed password with the stored password
          const isMatch = await bcrypt.compare(this._password, hashedPassword);
          if (isMatch) {
            // redirect user to dashboard
            window.location.href = "Dashboard";
          } else {
            console.log("Wrong password");
            document.getElementById("error-message").innerHTML = "Wrong password";
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
    get username() {
      return this._username;
    }
    set username(value) {
      this._username = value;
    }
    get password() {
      return this._password;
    }
    set password(value) {
      this._password = value;
    }
  }

const RandomStringGenerator = require('./RandomStringGenerator');
let generator = new RandomStringGenerator(4);
class CreateSurvey {
  constructor(userName, postTitle, postQuestion) {
    this._userName = userName;
    this._postTitle = postTitle;
    this._postQuestion = postQuestion;
  }

  get userName() {
    return this._userName;
  }

  set userName(newUserName) {
    this._userName = newUserName;
  }

  get postTitle() {
    return this._postTitle;
  }

  set postTitle(newPostTitle) {
    this._postTitle = newPostTitle;
  }

  get postQuestion() {
    return this._postQuestion;
  }

  set postQuestion(newPostQuestion) {
    this._postQuestion = newPostQuestion;
  }

  createSurvey(req, res, Survey) {
    const requestedUser = this._userName;
    if (!this._postTitle || !this._postQuestion) {
      // title and question fields not filled, display error message
      res.render("Create_screen", {
        error: "You must fill in all the question field",
        requestedUser: requestedUser,
      });
    } else {
      let randomString = generator.generate();
      const newSurvey = new Survey({
        title: this._postTitle,
        question: this._postQuestion,
        code: randomString,
        user: requestedUser,
      });
      newSurvey.save(function (err) {
        if (!err) {
          res.redirect("/dashboard/" + requestedUser);
        } else {
          console.log(err);
        }
      });
    }
  }
}

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

module.exports = { SignUp, SignIn,ChangePassword, CreateSurvey };
