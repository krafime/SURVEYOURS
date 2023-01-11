var inputQuestion = document.getElementById("inputQuestion");
var add_question = document.getElementById("add_question");

add_question.onclick = function () {
    var newQuestion = document.createElement("input");
    newQuestion.setAttribute("type", "text");
    newQuestion.setAttribute("class", "form-control input-survey form-control-lg ");
    newQuestion.setAttribute("placeholder", "Input Question");
    newQuestion.setAttribute("name", "postQuestion");
    newQuestion.setAttribute("autocomplete", "off");
    newQuestion.setAttribute("style", "margin-bottom: 10px");
    newQuestion.setAttribute("style", "margin-top: 10px");
    inputQuestion.appendChild(newQuestion);
};

