class Dashboard {
    constructor(req) {
    this._requestedUser = req.cookies.currentUser;
    this._surveys = [];
    }

  getSurveys(req, res, Survey, Answer) {
    this._requestedUser = req.params.userName;

    Survey.find({ user: this._requestedUser }, (err, foundSurveys) => {
      if (!err) {
        this._surveys = foundSurveys;
        res.render("Dashboard", {
          surveys: this._surveys,
          requestedUser: this._requestedUser,
        });
      } else {
        console.log(err);
      }
    });
  }

  deleteSurvey(req, res, Survey, Answer) {
    const deleteID = req.body.delete;

    Survey.findById(deleteID, (err, survey) => {
      if (!err) {
        try{
        if (survey.user == this._requestedUser) {
          survey.remove();
          // delete answer to the survey
          Answer.deleteMany({ code: survey.code }, function (err) {
            if (!err) {
              console.log("Succesfully delete an item");
            } else {
              console.log(err);
            }
          });
          //find updated survey for the user
          Survey.find({ user: this._requestedUser }, (err, updatedSurveys) => {
            if (!err) {
              if (updatedSurveys !== null) {
                this._surveys = updatedSurveys;
                setTimeout(() => {
                  res.render("Dashboard", {
                    requestedUser: this._requestedUser,
                    surveys: this._surveys,
                  });
                }, 2200);
              } else {
                console.log("Cannot find updated surveys");
              }
            } else {
              console.log(err);
            }
          });
        } else {
          console.log("You don't have permission to delete this survey");
        }
    } catch (err) {
        Survey.find({ user: this._requestedUser }, (err, updatedSurveys) => {
            if (!err) {
              if (updatedSurveys !== null) {
                this._surveys = updatedSurveys;
                setTimeout(() => {
                  res.render("Dashboard", {
                    requestedUser: this._requestedUser,
                    surveys: this._surveys,
                  });
                });
              } else {
                console.log("Cannot find updated surveys");
              }
            } else {
              console.log(err);
            }
          });
    }
      } else {
        console.log(err);
      }
    });
  }
}
module.exports = Dashboard;
