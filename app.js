const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const randCode = require(__dirname + "/create_code.js");
const { check, validationResult } = require("express-validator");

const app = express();
app.use(express.static(__dirname + "public"));

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

////////////////// DATABASE //////////////////////////////////////////////////
mongoose.connect("mongodb://127.0.0.1:27017/surveyoursDB", {
  useNewUrlParser: true,
});

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const surveySchema = new mongoose.Schema({
  title: String,
  question: [],
  code: String,
  user: String,
});

const respondentSchema = new mongoose.Schema({
  answer: [],
  code: String,
  feedback: String,
});

const User = new mongoose.model("User", userSchema);
const Survey = new mongoose.model("Survey", surveySchema);
const Answer = new mongoose.model("Answer", respondentSchema);

////////////////////////// API /////////////////////////////////////////////////

// app.get("/", function (req, res) {
//   res.render("Respondent_Screen");
// });
app.get("/", function (req, res) {
  if (req.query.error) {
    res.render("Respondent_Screen_err", { error: req.query.error });
  } else {
    res.render("Respondent_Screen");
  }
});

app.post("/", function (req, res) {
  res.redirect("/");
});

app.get("/survey/:surveyCode", function (req, res) {
  const requestedCode = req.params.surveyCode;
  if (!requestedCode) {
    res.redirect("/?error=Please+enter+a+valid+code");
    return;
  }
  Survey.findOne({ code: requestedCode }, function (err, foundSurvey) {
    if (err) {
      console.log(err);
    } else {
      if (foundSurvey) {
        res.render("Survey_screen", {
          title: foundSurvey.title,
          errors: ["You must fill in all the answer field"],
          requestedCode: requestedCode,
          question: foundSurvey.question,
        });
      } else {
        res.redirect("/?error=Wrong+Code");
      }
    }
  });
});

// app.post("/survey/:surveyCode", function (req, res) {
//     const requestedCode = req.params.surveyCode;
//     Survey.findOne({ code: requestedCode }, (err, foundSurvey) => {
//       if (err) {
//         console.log(err);
//       } else {
//         let error = "";
//         for(let i = 0; i < foundSurvey.question.length; i++) {
//           if(!req.body.postAnswer[i]) {
//             error = "You must fill in all the answer field";
//             break;
//           }
//         }
//         if(error) {
//           res.render("Survey_screen_err", {
//             title: foundSurvey.title,
//             error: error,
//             requestedCode: requestedCode,
//             question: foundSurvey.question,
//           });
//         } else {
//           const newAnswer = new Answer({
//             answer: req.body.postAnswer,
//             code: requestedCode,
//             feedback: req.body.feedback,
//           });
//           newAnswer.save(function (err) {
//             if (!err) {
//               res.redirect("/");
//             } else {
//               console.log(err);
//             }
//           });
//         }
//       }
//     });
//   });

app.post("/survey/:surveyCode", function (req, res) {
  const requestedCode = req.params.surveyCode;
  let errors = [];
  if (!req.body.postAnswer) {
    // postAnswer field is empty, display error message
    Survey.findOne({ code: requestedCode }, (err, foundSurvey) => {
      if (err) {
        console.log(err);
      } else {
        res.render("Survey_screen_err", {
          title: foundSurvey.title,
          error: "You must fill in the answer field",
          requestedCode: requestedCode,
          question: foundSurvey.question,
        });
      }
    });
  } else {
    Survey.findOne({ code: requestedCode }, (err, foundSurvey) => {
      const newAnswer = new Answer({
        answer: req.body.postAnswer,
        code: requestedCode,
        feedback: req.body.feedback,
      });
      newAnswer.save(function (err) {
        if (!err) {
          res.redirect("/");
        } else {
          console.log(err);
        }
      });
    });
  }
});

app.get("/register", function (req, res) {
  res.render("SignUp_Screen");
});

app.post("/register", function (req, res) {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  if (!/^[a-zA-Z0-9]{8,}$/.test(password)) {
    // password does not meet requirements, display error message
    res.render("SignUp_Screen_err", {
      error: "Password must be at least 8 alphanumeric characters",
    });
  } else {
    User.findOne(
      {
        $or: [{ username: username }, { email: email }],
      },
      function (err, foundUser) {
        if (err) {
          console.log(err);
        } else {
          if (foundUser) {
            // check if the username or email is already in use
            if (foundUser.username === username) {
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
            bcrypt.hash(password, saltRounds, function (err, hash) {
              const newUser = new User({
                username: username,
                email: email,
                password: hash,
              });
              newUser.save(function (err) {
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
});

app.get("/login", function (req, res) {
  res.render("SignIn_Screen");
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne(
    {
      username: username,
    },
    function (err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          bcrypt.compare(password, foundUser.password, function (err, result) {
            if (result === true) {
              // passwords match, redirect to dashboard
              res.redirect("/dashboard/" + foundUser.username);
            } else {
              // passwords do not match, display error message
              res.render("SignIn_Screen_err", { error: "Wrong password" });
            }
          });
        } else {
          // user not found, display error message
          res.render("SignIn_Screen_err", { error: "User not found" });
        }
      }
    }
  );
});

app.get("/change", function (req, res) {
  res.render("Change_screen");
});

// app.post("/change", function (req, res) {
//     const email = req.body.email;
//     const currentPassword = req.body.password;
//     const newPassword = req.body.newPassword;

//     User.findOne({ email: email }, function (err, foundUser) {
//       if (err) {
//         console.log(err);
//       } else {
//         if (foundUser) {
//           // Compare current password with user's hashed password
//           bcrypt.compare(currentPassword, foundUser.password, function (err, result) {
//             if (result === true) {
//               // Hash new password
//               bcrypt.hash(newPassword, 10, function (err, hashedNewPassword) {
//                 if (err) {
//                   console.log(err);
//                 } else {
//                   // Update user's password in the database
//                   User.updateOne({ email: email }, { password: hashedNewPassword }, function (err) {
//                     if (err) {
//                       console.log(err);
//                     } else {
//                       // password change successfull
//                       res.redirect("/");
//                     }
//                   });
//                 }
//               });
//             } else {
//               // passwords do not match, display error message
//               res.render("Change_Screen_err", { error: "Wrong password" });
//             }
//           });
//         } else {
//           // user not found, display error message
//           res.render("Change_Screen_err", { error: "Email not found" });
//         }
//       }
//     });
//   });

app.post("/change", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const newPassword = req.body.newPassword;

  User.findOne({ email: email }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function (err, result) {
          if (result === true) {
            //Check if newPassword is valid
            if (/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(newPassword)) {
              bcrypt.hash(newPassword, 10, function (err, hash) {
                if (err) {
                  console.log(err);
                } else {
                  User.updateOne(
                    { email: email },
                    { $set: { password: hash } },
                    function (err) {
                      if (err) {
                        console.log(err);
                      } else {
                        res.redirect("/login");
                      }
                    }
                  );
                }
              });
            } else {
              // new password not valid
              res.render("Change_Screen_err", {
                error: "Password must be at least 8 alphanumeric characters",
              });
            }
          } else {
            // wrong password
            res.render("Change_Screen_err", { error: "Wrong Old Password" });
          }
        });
      } else {
        // email not found
        res.render("Change_Screen_err", { error: "Email not found" });
      }
    }
  });
});

app.get("/dashboard/:userName", function (req, res) {
  const requestedUser = req.params.userName;

  Survey.find(
    {
      user: requestedUser,
    },
    function (err, foundSurveys) {
      res.render("Dashboard", {
        surveys: foundSurveys,
        requestedUser: requestedUser,
      });
    }
  );
});

app.post("/dashboard/:userName", function (req, res) {
  const requestedUser = req.params.userName;
  const deleteID = req.body.delete;

  Survey.findByIdAndRemove(deleteID, function (err) {
    if (!err) {
      console.log("Succesfully delete an item");
      res.redirect("/dashboard/" + requestedUser);
    }
  });
});

app.get("/surveyResponden/:userName/:surveyCode", function (req, res) {
  const requestedCode = req.params.surveyCode;
  const requestedUser = req.params.userName;
  Answer.find(
    {
      code: requestedCode,
    },
    function (err, foundCode) {
      Survey.findOne(
        {
          code: requestedCode,
        },
        function (err, foundTitle) {
          res.render("survey_respondent", {
            title: foundTitle.title,
            answers: foundCode,
            requestedCode: requestedCode,
            requestedUser: requestedUser,
          });
        }
      );
    }
  );
});

app.post("/surveyResponden/:userName/:surveyCode", function (req, res) {
  const requestedCode = req.params.surveyCode;
  const requestedUser = req.params.userName;

  Survey.updateOne(
    { code: requestedCode },
    { title: req.body.newTitle },
    function (err) {
      if (!err) {
        res.redirect("/surveyResponden/" + requestedUser + "/" + requestedCode);
      } else {
        console.log(err);
      }
    }
  );
});

app.get("/answer/:userName/:surveyCode/:respondentID", function (req, res) {
  const requestedUser = req.params.userName;
  const requestedID = req.params.respondentID;
  const requestedCode = req.params.surveyCode;
  Answer.findOne(
    {
      _id: requestedID,
    },
    function (err, foundCode) {
      Survey.findOne(
        {
          code: requestedCode,
        },
        function (err, foundSurvey) {
          res.render("Respondent_answer", {
            questions: foundSurvey.question,
            answers: foundCode,
            feedback: foundCode,
            requestedID: requestedID,
            requestedCode: requestedCode,
            requestedUser: requestedUser,
          });
        }
      );
    }
  );
});

app.post("/answer/:userName/:surveyCode/:respondentID", function (req, res) {
  const requestedUser = req.params.userName;
  const requestedCode = req.params.surveyCode;
  const deleteID = req.body.delete;

  Answer.findByIdAndRemove(deleteID, function (err) {
    if (!err) {
      console.log("Succesfully delete an item");
      res.redirect("/surveyResponden/" + requestedUser + "/" + requestedCode);
    }
  });
});

app.get("/create/:userName", function (req, res) {
  const requestedUser = req.params.userName;
  res.render("Create_screen", {
    requestedUser: requestedUser,
  });
});

// app.post("/create/:userName", function (req, res) {
//   const requestedUser = req.params.userName;
//   const newSurvey = new Survey({
//     title: req.body.postTitle,
//     question: req.body.postQuestion,
//     code: randCode.randNum(4),
//     user: requestedUser,
//   });

//   newSurvey.save(function (err) {
//     if (!err) {
//       res.redirect("/dashboard/" + requestedUser);
//     } else {
//       console.log(err);
//     }
//   });
// });

app.post("/create/:userName", function (req, res) {
  const requestedUser = req.params.userName;

  if (!req.body.postTitle || !req.body.postQuestion) {
    // title and question fields not filled, display error message
    res.render("create_err", {
      error: "You need to fill survey name and question first",
      requestedUser: requestedUser,
    });
  } else {
    const newSurvey = new Survey({
      title: req.body.postTitle,
      question: req.body.postQuestion,
      code: randCode.randNum(4),
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
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
