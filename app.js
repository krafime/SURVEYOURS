const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { check, validationResult } = require("express-validator");
const swal = require("sweetalert2");
const { JSDOM } = require("jsdom");
const dom = new JSDOM();
global.document = dom.window.document;
const TakeSurvey = require("./JS/TakeSurvey");
const cookieParser = require("cookie-parser");
const { SignUp, SignIn,ChangePassword, CreateSurvey } = require("./JS/classUser");
const AnswerPage = require("./JS/AnswerPage");
const Dashboard = require("./JS/Dashboard");


const app = express();
app.use(express.static(__dirname + "public"));

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

app.use(cookieParser());

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

app.post("/survey/:surveyCode", async function (req, res) {
  const requestedCode = req.params.surveyCode;
  const submitAnswer = new TakeSurvey(requestedCode);
  try {
    submitAnswer.submitAnswer(req, res, Survey, Answer);
  } catch (error) {
    console.log(error);
  }
});

app.get("/register", function (req, res) {
  res.render("SignUp_Screen");
});

app.post("/register", async function (req, res) {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const signup = new SignUp(username, email, password);
  try {
    signup.registerUser(req, res, User);
  } catch (error) {
    console.log(error);
  }
});

app.get("/login", function (req, res) {
  res.render("SignIn_Screen");
});

app.post("/login", function (req, res) {
  const signIn = new SignIn(req.body.username, req.body.password);
  signIn.validate().then(() => {
    // check if the credentials are valid
    User.findOne(
      {
        username: signIn.username,
      },
      function (err, foundUser) {
        if (err) {
          console.log(err);
        } else {
          if (foundUser) {
            bcrypt.compare(
              signIn.password,
              foundUser.password,
              function (err, result) {
                if (result === true) {
                  // passwords match, redirect to dashboard
                  res.redirect("/dashboard/" + foundUser.username);
                } else {
                  // passwords do not match, display error message
                  res.render("SignIn_Screen_err", { error: "Wrong password" });
                }
              }
            );
          } else {
            // user not found, display error message
            res.render("SignIn_Screen_err", { error: "User not found" });
          }
        }
      }
    );
  });
});

app.get("/change", function (req, res) {
  res.render("Change_screen");
});

app.post("/change", async (req, res) => {
  const changePass = new ChangePassword(
    req.body.email,
    req.body.password,
    req.body.newPassword
  );
  await changePass.changePassword(req, res, User);
});

app.get("/dashboard/:userName", (req, res) => {
  const dashboard = new Dashboard(req);
  res.cookie("currentUser", req.params.userName);
  dashboard.getSurveys(req, res, Survey, Answer);
});

app.get("/dashboard", (req, res) => {
  const currentUser = req.cookies.currentUser;
  const dashboard = new Dashboard(currentUser);
  dashboard.getSurveys(req, res, Survey, Answer);
});

app.post("/dashboard/:userName", (req, res) => {
  const dashboard = new Dashboard(req);
  dashboard.deleteSurvey(req, res, Survey, Answer);
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
  const answerPage = new AnswerPage(req);
  answerPage.getAnswer(req, res, Survey, Answer);
});

app.post("/answer/:userName/:surveyCode/:respondentID", function (req, res) {
  const answerPage = new AnswerPage(req);
  answerPage.deleteAnswer(req, res, Answer);
});

app.get("/create/:userName", function (req, res) {
  const requestedUser = req.params.userName;
  res.render("Create_screen", {
    requestedUser: requestedUser,
  });
});

app.post("/create/:userName", function (req, res) {
  const requestedUser = req.params.userName;
  const postTitle = req.body.postTitle;
  const postQuestion = req.body.postQuestion;
  const createSurvey = new CreateSurvey(requestedUser, postTitle, postQuestion);
  createSurvey.createSurvey(req, res, Survey);
});

app.get("/logout", (req, res) => {
  res.clearCookie("currentUser");
  res.redirect("/");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
