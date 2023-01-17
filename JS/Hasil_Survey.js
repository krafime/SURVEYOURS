class Hasil_Survey {
  constructor(req) {
    this._requestedUser = req.params.userName;
    this._requestedID = req.params.respondentID;
    this._requestedCode = req.params.surveyCode;
  }
  getAnswer(req, res, Survey, Answer) {
    this._requestedUser = req.params.userName;
    this._requestedID = req.params.respondentID;
    this._requestedCode = req.params.surveyCode;
    Answer.findOne(
      {
        _id: this._requestedID,
      },
      (err, foundCode) => {
        Survey.findOne(
          {
            code: this._requestedCode,
          },
          (err, foundSurvey) => {
            res.render("Respondent_answer", {
              questions: foundSurvey.question,
              answers: foundCode,
              feedback: foundCode,
              requestedID: this._requestedID,
              requestedCode: this._requestedCode,
              requestedUser: this._requestedUser,
            });
          }
        );
      }
    );
  }
  deleteAnswer(req, res, Answer) {
    this._requestedUser = req.params.userName;
    this._requestedCode = req.params.surveyCode;
    this._deleteID = req.body.delete;

    Answer.findByIdAndRemove(this._deleteID, (err) => {
      if (!err) {
        console.log("Succesfully delete an item");
        setTimeout(() => {
          res.redirect(
            "/surveyResponden/" +
              this._requestedUser +
              "/" +
              this._requestedCode
          );
        }, 2200);
      } else {
        console.log(err);
      }
    });
  }
}
module.exports = Hasil_Survey;
