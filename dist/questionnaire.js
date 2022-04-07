"use strict";
// #### QUESTIONNAIRE MODULE ####
// This module implements the questionnaire functionality
;
;
// ########### PARSE METHODS
function parseQuestionnaire(questionnaire) {
    return {
        rootElement: questionnaire,
        questions: Array.from(questionnaire.children).map(x => parseQuestion(x))
    };
}
function parseQuestion(question) {
    const type = question.getAttribute('type');
    const text = Array.from(question.childNodes)
        .filter(x => x.tagName != 'DISTRACTOR'
        && x.tagName != 'SOLUTION');
    const answers = Array.from(question.childNodes)
        .filter(x => x.tagName == 'DISTRACTOR'
        || x.tagName == 'SOLUTION');
    return {
        type: type,
        text: text,
        answers: answers.map(x => parseAnswer(x)),
        rootElement: question
    };
}
function parseAnswer(answer) {
    const correct = (answer.tagName == 'SOLUTION') ? true : false;
    const text = Array.from(answer.childNodes)
        .filter(x => x.tagName != 'EXPLANATION');
    const explanation = answer.getElementsByTagName('explanation')[0];
    return {
        correct: correct,
        text: text,
        explanation: explanation,
        rootElement: answer
    };
}
// ############### main function
function setup() {
    // setup style
    const styleNode = document.createElement('style');
    styleNode.innerHTML = Ressources.style;
    document.getElementsByTagName('head')[0].appendChild(styleNode);
    const q_col = document.getElementsByTagName("questionnaire");
    // render every questionnaire in the HTML Document
    for (let i = q_col.length - 1; i >= 0; i--) {
        const questionnaire = q_col[i];
        // validate htmL Structure before parsing
        if (validateQuestionnaireStructure(questionnaire) == true) {
            const r = parseQuestionnaire(questionnaire);
            console.log(r);
            // Possible ValidationPoint (Attributes)
            renderQuestionnaire(r);
        }
        else {
            //DO NOTHING
        }
    }
}
window.onload = setup;
// render questionnaire:
// addEventListener for "click"-Events
// build wrapper-<div> and <img>-icons for
// - answer
// - question
// ### RENDER FUNCTIONS ###
// - state is stored in the DOM via attributes
// - as much hiding/showing as possible is done via css classes depending
//   on those attributes
// ### Questionnaire
// <questionnaire>
//  - total_questions
//  - current_question
function renderQuestionnaire(questionnaire) {
    const root = questionnaire.rootElement;
    root.setAttribute("total_questions", "" + questionnaire.questions.length);
    root.setAttribute("current_question", "1");
    root.innerHTML = `
    <div class="content-wrapper">
      <div class="question-overview">
      ${(questionnaire.questions.length == 1) ? '' : `Question 1 of ${questionnaire.questions.length}`}
      </div>
      ${questionnaire.questions.map(renderQuestion).join('')}
    </div>
  `;
}
// ### Question
// <question>
//  - type: "singlechoice"|"multiplechoice"
//  - visible: "true" or not present
//  - answer: "pending"|"correct"|"wrong"
function renderQuestion(question, index) {
    return `
    <question type="${question.type}"
              ${index == 0 ? 'visible="true"' : ''}
              answer="pending">
      <div class="correct-text">
        <p>Correct!</p>
      </div>
      <div class="wrong-text">
        <p>Wrong!</p>
      </div>
      <div class="question-header">
        <div>${question.text.map(nodeOuterHTML).join('')}</div>
      </div>
      ${question.answers.map((x) => renderAnswer(question.type, x)).join('')}
      <div class="question-footer">
        <div class="next-button" onClick="showNextQuestion(event)">
          Next
        </div>
        <div class="submit-button" onClick="submitAnswer(event)">
          Submit
        </div>
      </div>
    </question>
  `;
}
// event handlers:
// continue
function showNextQuestion(event) {
    var _a;
    const el = event.target;
    const currentQuestion = getTagRecursive(el, "question");
    const questionnaire = getTagRecursive(currentQuestion, "questionnaire");
    // update header
    const total_questions = parseInt(questionnaire.getAttribute("total_questions"));
    const current_question = parseInt(questionnaire.getAttribute("current_question"));
    if (current_question == total_questions) {
        console.error("Tried to show next question, but we are already at the last question. Emitted by:", currentQuestion, el);
        return;
    }
    questionnaire.setAttribute("current_question", (current_question + 1).toString());
    questionnaire.getElementsByClassName("question-overview")[0].textContent = `Question ${current_question + 1} of ${total_questions}`;
    // update visibility
    (_a = currentQuestion.nextElementSibling) === null || _a === void 0 ? void 0 : _a.setAttribute('visible', 'true');
    currentQuestion.removeAttribute('visible');
}
// submit
function submitAnswer(event) {
    const el = event.target;
    const question = getTagRecursive(el, "question");
    const answers = question.getElementsByTagName('answer');
    const correct = Array.from(answers).every(a => a.getAttribute('correct') == a.getAttribute('selected'));
    question.setAttribute('answer', correct ? 'correct' : 'wrong');
}
// ### Answer
// <answer>
//  - correct: "true"|"false"
//  - selected: "true"|"false"
function renderAnswer(type, answer) {
    return `
  <answer correct="${answer.correct ? 'true' : 'false'}" selected="false">
    <div class="wrapper-answer" onclick="selectAnswer(event)">
      <img class="answer-mark" src="${type == 'singlechoice' ? Ressources.circle_regular : Ressources.square_regular}">
      <div>
        ${answer.text.map(nodeOuterHTML).join('')}
        ${(answer.explanation == undefined) ? '' : answer.explanation.outerHTML}
      </div>
    </div>
  </answer>
  `;
}
// helper
function nodeOuterHTML(x) {
    const outerHTML = x.outerHTML;
    if (outerHTML == undefined) {
        const data = x.data;
        if (data == undefined) {
            return '';
        }
        return data;
    }
    console.log("outerHTML:" + outerHTML);
    return outerHTML;
}
// event handler
function selectAnswer(event) {
    const el = event.target;
    const answer = getTagRecursive(el, 'answer');
    const answermark = answer.getElementsByClassName('answer-mark')[0];
    const question = getTagRecursive(answer, 'question');
    if (answer.getAttribute('selected') == 'false') {
        answer.setAttribute('selected', 'true');
        answermark.setAttribute('src', Ressources.xmark_solid);
        if (question.getAttribute('type') == 'singlechoice') {
            submitAnswer(event);
        }
    }
    else {
        answer.setAttribute('selected', 'false');
        // we know it must be multiple choice - else we could not unselect stuff
        answermark.setAttribute('src', Ressources.square_regular);
    }
}
// ### Error
// render Function
function renderError(current_el, message) {
    const el_name = current_el.localName;
    const questionnaire = getTagRecursive(current_el, "questionnaire");
    const error_html = `
  <div class="error-wrapper">
    <div class="error-header">
      <h2> Why do I see this red funny box?</h2>
    </div>
    <div class="error-box">
    <p>There was a syntax error with:
    &lt;${el_name}&gt;</p>
    </div>
    <pre class="error-message">
    ${escapeHtml(message)}
    </pre>
  </div>
  `;
    questionnaire.innerHTML = error_html;
    console.log(error_html);
}
// helper
// escape HTML TAGS
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
// ######### VALIDATION METHODS ##########
// validateQuestionnaireStructure
// checks if all necessary tags in questionnaire have the correct parentElement
function validateQuestionnaireStructure(questionnaire) {
    let questions = questionnaire.getElementsByTagName("question");
    let answers = questionnaire.getElementsByTagName("answer");
    let explanation = questionnaire.getElementsByTagName("explanation");
    // validate given html tag elements
    if (validateHtmlTagElements(questions.length - 1, questions) == true
        && validateHtmlTagElements(answers.length - 1, answers) == true
        && validateHtmlTagElements(explanation.length - 1, explanation) == true) {
        return true;
    }
    else {
        return false;
    }
    function validateHtmlTagElements(i, col) {
        if (i >= 0) {
            let validated = validateStructure(col[i]);
            if (validated == true) {
                let bool = validateHtmlTagElements(i - 1, col);
                return bool;
            }
            else {
                return false;
            }
        }
        else {
            return true;
        }
    }
}
// ValidateStructure
// <questionnaire> -> <question> -> at least 2 <answer> -> <explanation>
// return either messageString or Boolean: True
function validateStructure(el) {
    const html_tag = el.tagName;
    const parent = el.parentElement;
    if (html_tag == "QUESTION") {
        // parent has to be a QUESTIONNAIRE
        return parentHasToBe(parent, "QUESTIONNAIRE");
    }
    else if (html_tag == "SOLUTION" || html_tag == "DISTRACTOR") {
        // parent has to be a QUESTION
        return parentHasToBe(parent, "QUESTION");
    }
    else if (html_tag == "EXPLANATION") {
        // parent has to be an SOLUTION OR DISTRACTOR
        return parentHasToBe(parent, "SOLUTION", "DISTRACTOR");
    }
    function parentHasToBe(parent, tag, tag_two) {
        if ((parent === null || parent === void 0 ? void 0 : parent.tagName) == tag || (parent === null || parent === void 0 ? void 0 : parent.tagName) == tag_two) {
            return true;
        }
        else {
            let msg = `HTML structure is invalid: Please check your input at:  ${parent === null || parent === void 0 ? void 0 : parent.outerHTML}`;
            renderError(el, msg);
            return false;
        }
    }
}
// validateAttributes
// check <question> attribute singlechoice | multiplechoice
// check multiple <answer> attributes for at least (for multiplechoice) 1 correct answer
// returns true (for successful validation) or false (fail)
function validateAttribute(question) {
    let val = question.type;
    let answers = question.answers;
    let i = answers.length - 1;
    let x = 0;
    let correct_answers = getCorrectAnswer(x, i);
    // get all correct answers to this question
    function getCorrectAnswer(x, i) {
        if (i >= 0) {
            let correct = answers[i].correct;
            if (correct == true) {
                x = getCorrectAnswer(x + 1, i - 1);
                return x;
            }
            else {
                x = getCorrectAnswer(x, i - 1);
                return x;
            }
        }
        else {
            return x;
        }
    }
    // if attr value does not exist
    if (val == null) {
        let msg = `Necessary attribute &lt;question type='' &gt; is missing at: ${question.rootElement.outerHTML}`;
        renderError(question.rootElement, msg);
        return false;
    }
    // if value exists, but is not correctly assigned
    else if (val != "singlechoice" && val != "multiplechoice") {
        let msg = `Necessary attribute &lt;question type='' &gt; with value: ${val}is neither 'singlechoice' nor 'multiplechoice': ${question.rootElement.outerHTML}`;
        renderError(question.rootElement, msg);
        return false;
    }
    // if only 1 or less answer exists
    else if (answers.length < 2) {
        let msg = `You need to provide at least two answers for one question:  ${question.rootElement.outerHTML}`;
        renderError(question.rootElement, msg);
        return false;
    }
    else if (correct_answers == 0) {
        let msg = `There is no correct answer in this question: ${question.rootElement.outerHTML}`;
        renderError(question.rootElement, msg);
        return false;
    }
    // if question attr is singlechoice, but more than one correct answer exists
    else if (val == "singlechoice" && correct_answers > 1) {
        let msg = `There is more than one correct answer, but your question type is 'singlechoice': " ${question.rootElement.outerHTML}`;
        renderError(question.rootElement, msg);
        return false;
    }
    else {
        return true;
    }
}
// ######## HELPER FUNCTIONS #######
// getTagRecursive from a child element
// if element has TagName
// return;
// else: retry with parentElement
function getTagRecursive(el, tag) {
    if (el.tagName == tag.toUpperCase()) {
        return el;
    }
    else {
        let parent = el.parentElement;
        let result = getTagRecursive(parent, tag);
        return result;
    }
}
// ### EVENT HANDLER FUNCTIONS ###
// EVENT AFTER BUTTON "prev" OR "next" CLICK
// questionChangeHandler
// EventHandler -> DOM Manipulation
// function questionChangeHandler(event: Event) {
//   // get Questionnaire attributes
//   let el: HTMLElement = event.target as HTMLElement;
//   let button = el.getAttribute("id");
//   let questionnaire: HTMLElement = getTagRecursive(el, "questionnaire") as HTMLElement;
//   let total_questions: number = parseInt(questionnaire.getAttribute("total_questions") as string);
//   let current_question: number = parseInt(questionnaire.getAttribute("current_question") as string);
//   let questions = questionnaire.getElementsByTagName("question");
//   let min_qid: number = 0;
//   let max_qid: number = total_questions - 1;
//   let qid = current_question - 1;
//   // change question
//   // if button is "prev"
//   switch (button) {
//     case "prev_button":
//       let prev_qid = current_question - 1;
//       // change visibility to the previous question
//       questions[qid].removeAttribute("visible");
//       questions[qid - 1].setAttribute("visible", "true");
//       // change question overview text
//       questionnaire.setAttribute("current_question", prev_qid.toString());
//       questionnaire.getElementsByClassName("question-overview")[0].textContent = "Question " + prev_qid.toString() + " of " + total_questions;
//       //hide button if button to first question
//       if (prev_qid - 1 == min_qid) {
//         el.setAttribute("style", "visibility:hidden;");
//       }
//       // show next-Button
//       el.nextElementSibling ?.setAttribute("style", "visibility:visible;");
//       break;
//
//     case "next_button":
//       let next_qid = qid + 1;
//       questions[qid].removeAttribute("visible");
//       questions[next_qid].setAttribute("visible", "true");
//       //change question overview text
//       questionnaire.setAttribute("current_question", (current_question + 1).toString());
//       questionnaire.getElementsByClassName("question-overview")[0].textContent = "Question " + (current_question + 1).toString() + " of " + total_questions;
//       // hide button if button to last question
//       if (next_qid == max_qid) {
//         el.setAttribute("style", "visibility:hidden;");
//       }
//       //show prev_button
//       el.previousElementSibling ?.setAttribute("style", "visibility:visible;");
//       break;
//
//     default:
//       console.log("No Button caused this EventHandler", button);
//       break;
//   }
//
//
// }
//
//
//
// // CollapseEventHandler
// // Handles Collapse Event for shoowing explanation texts
// function collapseEventHandler(event: Event) {
//   const el = event.target as HTMLElement;
//   const question: HTMLElement = getTagRecursive(el, "question") as HTMLElement;
//   const answers: HTMLCollection = question.getElementsByTagName("answer") as HTMLCollection;
//   //change icons and collapse
//   if (el.getAttribute("clicked") == "true") {
//     el.setAttribute("src", Ressources.plus_solid);
//     el.setAttribute("clicked", "false");
//     for (let i = answers.length - 1; i >= 0; i--) {
//       let answer = answers[i] as HTMLElement;
//       let explanation = answer.getElementsByTagName("explanation")[0];
//       (explanation != undefined) ? explanation.removeAttribute("visible"): "";
//     }
//   }
//   else {
//     el.setAttribute("src", Ressources.minus_solid);
//     el.setAttribute("clicked", "true");
//     for (let i = answers.length - 1; i >= 0; i--) {
//       let answer = answers[i] as HTMLElement;
//       let explanation = answer.getElementsByTagName("explanation")[0];
//       (explanation != undefined) ? explanation.setAttribute("visible", "true"): "";
//     }
//   }
// }
// // show <explanation>
// //Answer->DOM Manipulation
// function showExplanation(answer: HTMLElement) {
//   let explanation: HTMLElement = answer.getElementsByTagName("explanation")[0] as HTMLElement;
//   if (explanation.getAttribute("visible") == "true") {
//     explanation.removeAttribute("visible");
//   }
//   else {
//     explanation.setAttribute("visible", "true");
//   }
// }
// // unified click on answer event handler
// function clickAnswerHandler(event: Event) {
//   const el = event.target as HTMLElement;
//   checkAnswerEventHandler(el);
//   // show Explanation
//   let answer = getTagRecursive(el, "answer");
//   if (answer.getElementsByTagName('explanation').length == 0){
//     console.log("There is no explanation");
//   }
//   else{
//     showExplanation(answer);
//   }
// }
//
//
// // check click for correct answer
// // depending on question type show either
// // - for multiplechoice just clicked answer
// // - for singlechoice all answers
// function checkAnswerEventHandler(el: HTMLElement) {
//   let question_type = getTagRecursive(el, "question").getAttribute("type");
//   if (question_type == "multiplechoice") {
//     let answer = getTagRecursive(el, "answer");
//     showAnswer(answer);
//   }
//   else if (question_type == "singlechoice") {
//     let answers = getTagRecursive(el, "question").getElementsByTagName("answer") as HTMLCollection;
//     for (let i = answers ?.length - 1; i >= 0; i--) {
//       let answer: HTMLElement = answers[i] as HTMLElement;
//       showAnswer(answer);
//     }
//   }
// }
// // showAnswer
// // show icons and highlight answer
// function showAnswer(answer: HTMLElement) {
//   answer.setAttribute("clicked", "true");
//   let img = answer.getElementsByTagName("img")[0];
//   if (answer.getAttribute("correct") == "true") {
//     img.setAttribute("src", Ressources.check_solid);
//   }
//   else {
//     img.setAttribute("src", Ressources.xmark_solid);
//   }
// }
var Ressources;
(function (Ressources) {
    Ressources.angle_left_solid = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMTkyIDQ0OGMtOC4xODggMC0xNi4zOC0zLjEyNS0yMi42Mi05LjM3NWwtMTYwLTE2MGMtMTIuNS0xMi41LTEyLjUtMzIuNzUgMC00NS4yNWwxNjAtMTYwYzEyLjUtMTIuNSAzMi43NS0xMi41IDQ1LjI1IDBzMTIuNSAzMi43NSAwIDQ1LjI1TDc3LjI1IDI1NmwxMzcuNCAxMzcuNGMxMi41IDEyLjUgMTIuNSAzMi43NSAwIDQ1LjI1QzIwOC40IDQ0NC45IDIwMC4yIDQ0OCAxOTIgNDQ4eiIvPjwvc3ZnPg==`;
    Ressources.angle_right_solid = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNjQgNDQ4Yy04LjE4OCAwLTE2LjM4LTMuMTI1LTIyLjYyLTkuMzc1Yy0xMi41LTEyLjUtMTIuNS0zMi43NSAwLTQ1LjI1TDE3OC44IDI1Nkw0MS4zOCAxMTguNmMtMTIuNS0xMi41LTEyLjUtMzIuNzUgMC00NS4yNXMzMi43NS0xMi41IDQ1LjI1IDBsMTYwIDE2MGMxMi41IDEyLjUgMTIuNSAzMi43NSAwIDQ1LjI1bC0xNjAgMTYwQzgwLjM4IDQ0NC45IDcyLjE5IDQ0OCA2NCA0NDh6Ii8+PC9zdmc+`;
    Ressources.check_solid = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDM4LjYgMTA1LjRDNDUxLjEgMTE3LjkgNDUxLjEgMTM4LjEgNDM4LjYgMTUwLjZMMTgyLjYgNDA2LjZDMTcwLjEgNDE5LjEgMTQ5LjkgNDE5LjEgMTM3LjQgNDA2LjZMOS4zNzIgMjc4LjZDLTMuMTI0IDI2Ni4xLTMuMTI0IDI0NS45IDkuMzcyIDIzMy40QzIxLjg3IDIyMC45IDQyLjEzIDIyMC45IDU0LjYzIDIzMy40TDE1OS4xIDMzOC43TDM5My40IDEwNS40QzQwNS45IDkyLjg4IDQyNi4xIDkyLjg4IDQzOC42IDEwNS40SDQzOC42eiIvPjwvc3ZnPg==`;
    Ressources.circle_regular = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNTEyIDI1NkM1MTIgMzk3LjQgMzk3LjQgNTEyIDI1NiA1MTJDMTE0LjYgNTEyIDAgMzk3LjQgMCAyNTZDMCAxMTQuNiAxMTQuNiAwIDI1NiAwQzM5Ny40IDAgNTEyIDExNC42IDUxMiAyNTZ6TTI1NiA0OEMxNDEuMSA0OCA0OCAxNDEuMSA0OCAyNTZDNDggMzcwLjkgMTQxLjEgNDY0IDI1NiA0NjRDMzcwLjkgNDY0IDQ2NCAzNzAuOSA0NjQgMjU2QzQ2NCAxNDEuMSAzNzAuOSA0OCAyNTYgNDh6Ii8+PC9zdmc+`;
    Ressources.minus_solid = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDAwIDI4OGgtMzUyYy0xNy42OSAwLTMyLTE0LjMyLTMyLTMyLjAxczE0LjMxLTMxLjk5IDMyLTMxLjk5aDM1MmMxNy42OSAwIDMyIDE0LjMgMzIgMzEuOTlTNDE3LjcgMjg4IDQwMCAyODh6Ii8+PC9zdmc+`;
    Ressources.plus_solid = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDMyIDI1NmMwIDE3LjY5LTE0LjMzIDMyLjAxLTMyIDMyLjAxSDI1NnYxNDRjMCAxNy42OS0xNC4zMyAzMS45OS0zMiAzMS45OXMtMzItMTQuMy0zMi0zMS45OXYtMTQ0SDQ4Yy0xNy42NyAwLTMyLTE0LjMyLTMyLTMyLjAxczE0LjMzLTMxLjk5IDMyLTMxLjk5SDE5MnYtMTQ0YzAtMTcuNjkgMTQuMzMtMzIuMDEgMzItMzIuMDFzMzIgMTQuMzIgMzIgMzIuMDF2MTQ0aDE0NEM0MTcuNyAyMjQgNDMyIDIzOC4zIDQzMiAyNTZ6Ii8+PC9zdmc+`;
    Ressources.square_regular = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4xIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMzg0IDMyQzQxOS4zIDMyIDQ0OCA2MC42NSA0NDggOTZWNDE2QzQ0OCA0NTEuMyA0MTkuMyA0ODAgMzg0IDQ4MEg2NEMyOC42NSA0ODAgMCA0NTEuMyAwIDQxNlY5NkMwIDYwLjY1IDI4LjY1IDMyIDY0IDMySDM4NHpNMzg0IDgwSDY0QzU1LjE2IDgwIDQ4IDg3LjE2IDQ4IDk2VjQxNkM0OCA0MjQuOCA1NS4xNiA0MzIgNjQgNDMySDM4NEMzOTIuOCA0MzIgNDAwIDQyNC44IDQwMCA0MTZWOTZDNDAwIDg3LjE2IDM5Mi44IDgwIDM4NCA4MHoiLz48L3N2Zz4=`;
    Ressources.xmark_solid = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMzEwLjYgMzYxLjRjMTIuNSAxMi41IDEyLjUgMzIuNzUgMCA0NS4yNUMzMDQuNCA0MTIuOSAyOTYuMiA0MTYgMjg4IDQxNnMtMTYuMzgtMy4xMjUtMjIuNjItOS4zNzVMMTYwIDMwMS4zTDU0LjYzIDQwNi42QzQ4LjM4IDQxMi45IDQwLjE5IDQxNiAzMiA0MTZTMTUuNjMgNDEyLjkgOS4zNzUgNDA2LjZjLTEyLjUtMTIuNS0xMi41LTMyLjc1IDAtNDUuMjVsMTA1LjQtMTA1LjRMOS4zNzUgMTUwLjZjLTEyLjUtMTIuNS0xMi41LTMyLjc1IDAtNDUuMjVzMzIuNzUtMTIuNSA0NS4yNSAwTDE2MCAyMTAuOGwxMDUuNC0xMDUuNGMxMi41LTEyLjUgMzIuNzUtMTIuNSA0NS4yNSAwczEyLjUgMzIuNzUgMCA0NS4yNWwtMTA1LjQgMTA1LjRMMzEwLjYgMzYxLjR6Ii8+PC9zdmc+`;
    Ressources.style = `/* ERROR MESSAGE */
questionnaire .error-wrapper{
  display:block;
  max-width: 600px;
  border: 5px solid red;
   margin: 0 auto;
  padding:0 20px;
}
questionnaire .error-header{

}
questionnaire .error-box{
font-size:16pt;
line-height:1.5em;
}

questionnaire .error-message{
  font-family:monospace;
  font-size:12pt;
}

/* QUESTIONNAIRE */
/* Basic layout */
questionnaire {
  display: block;
  margin: 40px 0 100px ;
}
questionnaire .content-wrapper {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  margin: 10px;
  padding: 10px;
  justify-content: center;
}

questionnaire .question-overview{
margin: 0 auto 10px;
font-size:1.1em;
}
questionnaire question{
  width: 90%;
  margin: 0 auto;
  font-size: 18pt;
  padding:4vw;
  background-color: #fcfcfc;
}

questionnaire .question-header, questionnaire .question-footer, questionnaire .wrapper-answer {
  display: inline-flex;
  width: 100%;
}

questionnaire .question-header {
  justify-content: space-between;
  margin-bottom: 0.5em;
}

questionnaire .question-footer{
  justify-content: center;
}

questionnaire .wrapper-answer {
  border: 1px solid #eee;
  padding: 5px 12px;
  font-size: 14pt;
  margin: 15px 0 0;
  width:90%;
}

questionnaire answer p {
  margin: 0 0 0 16px;
  padding: 6px;
  /*font-size: 12pt;
  border: 1px solid #000;
  width:100%;*/
}

questionnaire .wrapper-answer:hover, questionnaire img:hover, questionnaire .change-question-button:hover {
  cursor: pointer;
  /*background-color: #ddd;*/
}

questionnaire .wrapper-answer:hover {
  background-color: #eee;
}


questionnaire explanation {
  display: none;
  /*max-width: 30vw;*/
}

questionnaire answer [visible=true] {
  margin: 5px 0;
  padding: 15px 12px;
  font-size: 12pt;
  word-break: break-word;
  border:0;
  background-color: #fdfdfd;
}

questionnaire answer [visible=true] p {
  border: 0;
}

questionnaire img {
  height: 1em;
  align-self: center;
}

questionnaire p {
  margin: 0;
  align-self: center;
}

questionnaire .wrapper-answer > div, questionnaire .question-header > div {
  margin: 0.5em;
  align-self: center;
}

questionnaire [clicked=true] .wrapper-answer, questionnaire [clicked=true] .wrapper-answer:hover{
  background-color:#d30000;
}

questionnaire [clicked=true][correct=true] .wrapper-answer{
  background-color:#aceb84;
}

@media (min-width: 768px) {
  questionnaire question {
    max-width: 600px;
  }
}

/* FEEDBACK */
/* text */
questionnaire .correct-text, questionnaire .wrong-text {
  display: inline-flex;
  width: 100%;
  justify-content: center;
  display: none;
}

questionnaire question[answer="correct"] .correct-text {
  display: inline-flex;
  color: darkgreen;
}

questionnaire question[answer="wrong"] .wrong-text {
  display: inline-flex;
  color: darkred;
}

/* answers */
/* *="o" means correct or wrong, not pending */
questionnaire question[answer*="o"] answer[correct="true"][selected="true"] .wrapper-answer {
  border: 2px solid green;
}
questionnaire question[answer*="o"] answer[correct="true"] .wrapper-answer {
  background-color: lightgreen;
}
questionnaire question[answer*="o"] answer[correct="false"][selected="true"] .wrapper-answer {
  background-color: lightpink;
}

/* NAVIGATION */
/* only show question that has been set visible */
questionnaire question{
  display:none;
}
questionnaire [visible=true]{
  display:block;
}

/* button styles */
questionnaire .submit-button, questionnaire .next-button {
  padding:15px;
  margin:5px 15px;
  border: 4px solid #bbb;
  border-radius: 7px;
  font-size:1.3em;
}
questionnaire .submit-button:hover, questionnaire .next-button:hover{
  background-color: #bbb;
  cursor:pointer;
}

/* show submit-button for unanswered multiplechoice questions */
questionnaire .submit-button {
  display: none;
}
questionnaire question[type="multiplechoice"][answer="pending"] .submit-button {
  display: block;
}

/* show next-button for answered questions */
questionnaire .next-button {
  display: block;
}
questionnaire question[answer="pending"] .next-button {
  display: none;
}
questionnaire question:last-of-type .next-button {
  display: none;
}`;
})(Ressources || (Ressources = {}));
