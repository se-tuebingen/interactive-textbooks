"use strict";
// #### QUESTIONNAIRE MODULE ####
// This module implements the questionnaire functionality
// <questionnaire> <- List of questions
//   <question type="multiplechoice|singlechoice">
//     Question Text
//     <answer correct="true|false">
//       Answer Text
//       <explanation>Explanation Text
function setup() {
    // setup style
    var styleNode = document.createElement('style');
    styleNode.innerHTML = Ressources.style;
    document.getElementsByTagName('head')[0].appendChild(styleNode);
    var q_col = document.getElementsByTagName("questionnaire");
    // render every questionnaire in the HTML Document
    for (var i = q_col.length - 1; i >= 0; i--) {
        var questionnaire = q_col[i];
        renderQuestionaire(questionnaire);
    }
}
window.onload = setup;
// render questionnaire:
// addEventListener for "click"-Events
// build wrapper-<div> and <img>-icons for
// - answer
// - question
function renderQuestionaire(questionnaire) {
    console.log(questionnaire);
    //build wrapper-content
    var content = makeDiv("wrapper-content");
    var children = questionnaire.children;
    // prepend question-overview
    var q_overview = makeDiv("question-overview");
    q_overview.textContent = "Frage 1" + " von " + children.length;
    content.prepend(q_overview);
    // set attributes for QUESTIONNAIRE
    questionnaire.setAttribute("total_questions", "" + children.length);
    questionnaire.setAttribute("current_question", "1");
    // access children and append to wrapper-content
    for (var i = children.length - 1; i >= 0; i--) {
        content.append(children[i]);
    }
    questionnaire.prepend(content);
    //render Questions + Answers
    renderQuestions(questionnaire);
    renderAnswers(questionnaire);
    // build question footer
    var footer = makeDiv("question-footer");
    content.append(footer);
    //build 2 buttons
    var prev_button = makeDiv("change-question-button");
    var next_button = makeDiv("change-question-button");
    prev_button.setAttribute("id", "prev_button");
    next_button.setAttribute("id", "next_button");
    prev_button.setAttribute("style", "visibility:hidden;");
    prev_button.textContent = "prev";
    next_button.textContent = "next";
    prev_button.addEventListener("click", questionChangeHandler);
    next_button.addEventListener("click", questionChangeHandler);
    footer.append(prev_button, next_button);
}
//questionChangeHandler
//EventHandler -> DOM Manipulation
function questionChangeHandler() {
    var _a, _b, _c, _d;
    // get Questionnaire attributes
    var button = this.getAttribute("id");
    var questionnaire = (_b = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.parentElement;
    var min_qid = 0;
    var max_qid = parseInt(questionnaire.getAttribute("total_questions")) - 1;
    var current_qid = parseInt(questionnaire.getAttribute("current_question")) - 1;
    var questions = questionnaire.getElementsByTagName("question");
    // change question
    if (button == "prev_button") {
        questions[current_qid].removeAttribute("visible");
        questions[current_qid - 1].setAttribute("visible", "true");
        var str_current = current_qid.toString();
        questionnaire.setAttribute("current_question", str_current);
        questionnaire.getElementsByClassName("question-overview")[0].textContent = "Frage " + str_current + " von " + questions.length;
        //hide button if first question
        if (current_qid - 1 == min_qid) {
            this.setAttribute("style", "visibility:hidden;");
        }
        (_c = this.nextElementSibling) === null || _c === void 0 ? void 0 : _c.setAttribute("style", "visibility:visible;");
    }
    else if (button == "next_button") {
        questions[current_qid].removeAttribute("visible");
        questions[current_qid + 1].setAttribute("visible", "true");
        //change questionnaire attributes
        var str_current = (current_qid + 2).toString();
        questionnaire.setAttribute("current_question", str_current);
        //change question overview
        questionnaire.getElementsByClassName("question-overview")[0].textContent = "Frage " + str_current + " von " + questions.length;
        // hide button if last question
        if (current_qid + 1 == max_qid) {
            this.setAttribute("style", "visibility:hidden;");
        }
        (_d = this.previousElementSibling) === null || _d === void 0 ? void 0 : _d.setAttribute("style", "visibility:visible;");
    }
    else {
        console.log("No Button caused this EventHandler", button);
    }
    // hide buttons, if last / first question
    console.log(current_qid, max_qid, min_qid);
}
// renderQuestions
// for every question:
// add <div>-wrapper + <img>-icon (done)
// add EventListener for CollapseAll-Function
function renderQuestions(questionnaire) {
    // get wrapper-content
    var wrapper_content = questionnaire.firstChild;
    var questions = questionnaire.getElementsByTagName("question");
    var lastIndex = questions.length - 1;
    questions[lastIndex].setAttribute("visible", "true");
    for (var i = lastIndex; i >= 0; i--) {
        var question = questions[i];
        buildQuestionHeader(question);
        //append question to wrapper-content
        wrapper_content.append(question);
    }
}
// question->DOM Manipulation
// Question Text and CollapseAll-Functionality in question-header
function buildQuestionHeader(question) {
    var text = document.createElement("p");
    text.innerHTML = question.childNodes[0].data;
    question.childNodes[0].remove();
    var header = document.createElement("div");
    header.setAttribute("class", "question-header");
    question.prepend(header);
    // append text and img
    var img = document.createElement("img");
    img.setAttribute("src", Ressources.plus_solid);
    img.addEventListener("click", ExplanationEventHandler.bind(img, true));
    header.append(text, img);
}
// questionnaire->DOM Manipulation
function renderAnswers(questionnaire) {
    var answers = questionnaire.getElementsByTagName("answer");
    //for every answer:
    // add <div> wrapper + <img>-icon (done)
    // add EventListener for AnswerClickEvents (done)
    for (var i = answers.length - 1; i >= 0; i--) {
        var answer = answers[i];
        // build div-wrapper
        var new_div = document.createElement("div");
        var text = document.createElement("p");
        text.innerHTML = answer.childNodes[0].data;
        answer.childNodes[0].remove();
        new_div.setAttribute("class", "wrapper-answer");
        answer.prepend(new_div);
        //append text and img
        var img = document.createElement("img");
        img.setAttribute("src", Ressources.circle_regular);
        new_div.append(img, text);
        answer.addEventListener("click", checkAnswer);
        answer.addEventListener("click", ExplanationEventHandler.bind(answer, false));
    }
}
// ExplanationEventHandler
// Handles Events for shoowing explanation text
function ExplanationEventHandler(collapse) {
    var _a;
    if (collapse == true) {
        var question = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
        var answers = question.getElementsByTagName("answer");
        //change icons and collapse
        if (this.getAttribute("clicked") == "true") {
            this.setAttribute("src", Ressources.plus_solid);
            this.setAttribute("clicked", "false");
            for (var i = answers.length - 1; i >= 0; i--) {
                var answer = answers[i];
                answer.getElementsByTagName("explanation")[0].removeAttribute("visible");
            }
        }
        else {
            this.setAttribute("src", Ressources.minus_solid);
            this.setAttribute("clicked", "true");
            for (var i = answers.length - 1; i >= 0; i--) {
                var answer = answers[i];
                answer.getElementsByTagName("explanation")[0].setAttribute("visible", "true");
            }
        }
    }
    else {
        showExplanation(this);
    }
}
// show <explanation>
//Answer->DOM Manipulation
function showExplanation(answer) {
    var explanation = answer.getElementsByTagName("explanation")[0];
    if (explanation.getAttribute("visible") == "true") {
        explanation.removeAttribute("visible");
    }
    else {
        explanation.setAttribute("visible", "true");
    }
}
// check click for correcct answer
// depending on question type show either
// - for multiplechoice just clicked answer
// - for singlechoice all answers
function checkAnswer() {
    var _a, _b;
    var question_type = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.getAttribute("type");
    if (question_type == "multiplechoice") {
        showAnswer(this);
    }
    else if (question_type == "singlechoice") {
        var answers = (_b = this.parentElement) === null || _b === void 0 ? void 0 : _b.getElementsByTagName("answer");
        for (var i = (answers === null || answers === void 0 ? void 0 : answers.length) - 1; i >= 0; i--) {
            var answer = answers[i];
            showAnswer(answer);
        }
    }
}
// showAnswer
// show icons and highlight answer
function showAnswer(answer) {
    answer.setAttribute("clicked", "true");
    var img = answer.getElementsByTagName("img")[0];
    if (answer.getAttribute("correct") == "true") {
        img.setAttribute("src", Ressources.check_solid);
    }
    else {
        img.setAttribute("src", Ressources.xmark_solid);
    }
}
// makeDiv
// ClassName as String -> HTMLDivElement
function makeDiv(css_name) {
    var new_div = document.createElement("div");
    new_div.setAttribute("class", css_name);
    return new_div;
}
// swipeEvent
// const divContainer = document.getElementById("touch-event-test");
// divContainer.addEventListener("")
// function (){
//
// }
var Ressources;
(function (Ressources) {
    Ressources.angle_left_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAy\nNTYgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt\nIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l\nLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp\nY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMTkyIDQ0OGMtOC4xODggMC0xNi4zOC0zLjEyNS0y\nMi42Mi05LjM3NWwtMTYwLTE2MGMtMTIuNS0xMi41LTEyLjUtMzIuNzUgMC00NS4yNWwxNjAt\nMTYwYzEyLjUtMTIuNSAzMi43NS0xMi41IDQ1LjI1IDBzMTIuNSAzMi43NSAwIDQ1LjI1TDc3\nLjI1IDI1NmwxMzcuNCAxMzcuNGMxMi41IDEyLjUgMTIuNSAzMi43NSAwIDQ1LjI1QzIwOC40\nIDQ0NC45IDIwMC4yIDQ0OCAxOTIgNDQ4eiIvPjwvc3ZnPg==\n";
    Ressources.angle_right_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAy\nNTYgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt\nIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l\nLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp\nY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNjQgNDQ4Yy04LjE4OCAwLTE2LjM4LTMuMTI1LTIy\nLjYyLTkuMzc1Yy0xMi41LTEyLjUtMTIuNS0zMi43NSAwLTQ1LjI1TDE3OC44IDI1Nkw0MS4z\nOCAxMTguNmMtMTIuNS0xMi41LTEyLjUtMzIuNzUgMC00NS4yNXMzMi43NS0xMi41IDQ1LjI1\nIDBsMTYwIDE2MGMxMi41IDEyLjUgMTIuNSAzMi43NSAwIDQ1LjI1bC0xNjAgMTYwQzgwLjM4\nIDQ0NC45IDcyLjE5IDQ0OCA2NCA0NDh6Ii8+PC9zdmc+\n";
    Ressources.check_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0\nNDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt\nIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l\nLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp\nY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDM4LjYgMTA1LjRDNDUxLjEgMTE3LjkgNDUxLjEg\nMTM4LjEgNDM4LjYgMTUwLjZMMTgyLjYgNDA2LjZDMTcwLjEgNDE5LjEgMTQ5LjkgNDE5LjEg\nMTM3LjQgNDA2LjZMOS4zNzIgMjc4LjZDLTMuMTI0IDI2Ni4xLTMuMTI0IDI0NS45IDkuMzcy\nIDIzMy40QzIxLjg3IDIyMC45IDQyLjEzIDIyMC45IDU0LjYzIDIzMy40TDE1OS4xIDMzOC43\nTDM5My40IDEwNS40QzQwNS45IDkyLjg4IDQyNi4xIDkyLjg4IDQzOC42IDEwNS40SDQzOC42\neiIvPjwvc3ZnPg==\n";
    Ressources.circle_regular = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1\nMTIgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt\nIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l\nLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp\nY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNTEyIDI1NkM1MTIgMzk3LjQgMzk3LjQgNTEyIDI1\nNiA1MTJDMTE0LjYgNTEyIDAgMzk3LjQgMCAyNTZDMCAxMTQuNiAxMTQuNiAwIDI1NiAwQzM5\nNy40IDAgNTEyIDExNC42IDUxMiAyNTZ6TTI1NiA0OEMxNDEuMSA0OCA0OCAxNDEuMSA0OCAy\nNTZDNDggMzcwLjkgMTQxLjEgNDY0IDI1NiA0NjRDMzcwLjkgNDY0IDQ2NCAzNzAuOSA0NjQg\nMjU2QzQ2NCAxNDEuMSAzNzAuOSA0OCAyNTYgNDh6Ii8+PC9zdmc+\n";
    Ressources.minus_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0\nNDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt\nIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l\nLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp\nY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDAwIDI4OGgtMzUyYy0xNy42OSAwLTMyLTE0LjMy\nLTMyLTMyLjAxczE0LjMxLTMxLjk5IDMyLTMxLjk5aDM1MmMxNy42OSAwIDMyIDE0LjMgMzIg\nMzEuOTlTNDE3LjcgMjg4IDQwMCAyODh6Ii8+PC9zdmc+\n";
    Ressources.plus_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0\nNDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt\nIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l\nLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp\nY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDMyIDI1NmMwIDE3LjY5LTE0LjMzIDMyLjAxLTMy\nIDMyLjAxSDI1NnYxNDRjMCAxNy42OS0xNC4zMyAzMS45OS0zMiAzMS45OXMtMzItMTQuMy0z\nMi0zMS45OXYtMTQ0SDQ4Yy0xNy42NyAwLTMyLTE0LjMyLTMyLTMyLjAxczE0LjMzLTMxLjk5\nIDMyLTMxLjk5SDE5MnYtMTQ0YzAtMTcuNjkgMTQuMzMtMzIuMDEgMzItMzIuMDFzMzIgMTQu\nMzIgMzIgMzIuMDF2MTQ0aDE0NEM0MTcuNyAyMjQgNDMyIDIzOC4zIDQzMiAyNTZ6Ii8+PC9z\ndmc+\n";
    Ressources.xmark_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAz\nMjAgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt\nIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l\nLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp\nY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMzEwLjYgMzYxLjRjMTIuNSAxMi41IDEyLjUgMzIu\nNzUgMCA0NS4yNUMzMDQuNCA0MTIuOSAyOTYuMiA0MTYgMjg4IDQxNnMtMTYuMzgtMy4xMjUt\nMjIuNjItOS4zNzVMMTYwIDMwMS4zTDU0LjYzIDQwNi42QzQ4LjM4IDQxMi45IDQwLjE5IDQx\nNiAzMiA0MTZTMTUuNjMgNDEyLjkgOS4zNzUgNDA2LjZjLTEyLjUtMTIuNS0xMi41LTMyLjc1\nIDAtNDUuMjVsMTA1LjQtMTA1LjRMOS4zNzUgMTUwLjZjLTEyLjUtMTIuNS0xMi41LTMyLjc1\nIDAtNDUuMjVzMzIuNzUtMTIuNSA0NS4yNSAwTDE2MCAyMTAuOGwxMDUuNC0xMDUuNGMxMi41\nLTEyLjUgMzIuNzUtMTIuNSA0NS4yNSAwczEyLjUgMzIuNzUgMCA0NS4yNWwtMTA1LjQgMTA1\nLjRMMzEwLjYgMzYxLjR6Ii8+PC9zdmc+\n";
    Ressources.style = "body {\n  width: 100%;\n  margin: 0;\n  padding: 0;\n  font-family: monospace;\n}\n\nquestionnaire{\n  display:block;\n  margin:40px 0 100px ;\n}\n\n.wrapper-content {\n  display: flex;\n  flex-wrap: wrap;\n  flex-direction: column;\n  margin: 10px;\n  padding: 10px;\n  justify-content: center;\n}\nquestion{\n  display:none;\n}\n.question-overview{\nmargin: 0 auto 10px;\nfont-size:1.1em;\n}\nquestion{\n  width: 90%;\n  margin: 15px auto 15px;\n  font-size: 18pt;\n  padding:4vw;\n  background-color: #fcfcfc;\n}\n\n.question-header, .question-footer, .wrapper-answer {\n  display: inline-flex;\n  width: 100%;\n}\n\n.question-header {\n  justify-content: space-between;\n}\n\n.question-footer{\n  justify-content: center;\n}\n\n[visible=true]{\n    display:block;\n}\n\n.wrapper-answer, answer [visible=true] {\n  border: 1px solid #eee;\n  padding: 5px 12px;\n  font-size: 14pt;\n  margin: 15px 0 10px;\n  width:90%;\n}\n\nanswer p {\n  margin-left: 16px;\n  /*font-size: 12pt;\n  padding: 6px;\n  border: 1px solid #000;\n  width:100%;*/\n}\n\n.wrapper-answer:hover, img:hover, .change-question-button:hover {\n  cursor: pointer;\n  /*background-color: #ddd;*/\n}\n\n.wrapper-answer:hover {\n  background-color: #eee;\n}\n\n\nexplanation {\n  display: none;\n  /*max-width: 30vw;*/\n}\n\nanswer [visible=true] {\n\n  margin: 5px 0 20px;\n  padding: 15px 12px;\n  font-size: 12pt;\n  word-break: break-word;\n  border:0;\n  background-color: #fdfdfd;\n}\n\nanswer [visible=true] p {\n  border: 0;\n}\n\nimg {\n  height: auto;\n  width: 20px;\n}\n\n[clicked=true] .wrapper-answer, [clicked=true] .wrapper-answer:hover{\n  background-color:#d30000;\n}\n\n[clicked=true][correct=true] .wrapper-answer{\n  background-color:#aceb84;\n}\n\n.change-question-button{\n  padding:15px;\n  margin:15px 15px 0;\n  border: 4px solid #bbb;\n  border-radius: 7px;\n  font-size:1.3em;\n}\n.change-question-button:hover{\n  background-color: #bbb;\n}\n\n@media (min-width: 768px) {\n  question {\n    max-width: 500px;\n  }\n}";
})(Ressources || (Ressources = {}));
