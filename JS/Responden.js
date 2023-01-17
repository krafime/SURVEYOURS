class TakeSurvey {
  constructor(surveyCode) {
    this._surveyCode = surveyCode;
  }

  get surveyCode() {
    return this._surveyCode;
  }

  set surveyCode(newSurveyCode) {
    this._surveyCode = newSurveyCode;
  }

  takeSurvey(req, res, Survey, Answer) {
    const requestedCode = this._surveyCode;
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
  }

  submitAnswer(req, res, Survey, Answer) {
    const requestedCode = this._surveyCode;
    let errors = [];
    if (!req.body.postAnswer) {
      // postAnswer field is empty, display error message
      Survey.findOne({ code: requestedCode }, (err, foundSurvey) => {
        if (err) {
          console.log(err);
        } else {
          res.render("Survey_screen", {
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
  }
}
module.exports = TakeSurvey;
