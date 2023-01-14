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

module.exports = CreateSurvey;
