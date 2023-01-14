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

  module.exports = SignIn;
