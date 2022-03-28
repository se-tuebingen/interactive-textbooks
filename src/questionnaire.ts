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
  const styleNode = document.createElement('style');
  styleNode.innerHTML = Ressources.style;
  document.getElementsByTagName('head')[0].appendChild(styleNode);
  const q_col: HTMLCollection = document.getElementsByTagName("questionnaire") as HTMLCollection;
  // render every questionnaire in the HTML Document
  for (let i = q_col.length - 1; i >= 0; i--) {
    let questionnaire: HTMLElement = q_col[i] as HTMLElement;
    renderQuestionaire(questionnaire);
  }
}
window.onload = setup;

// render questionnaire:
// addEventListener for "click"-Events
// build wrapper-<div> and <img>-icons for
// - answer
// - question

function renderQuestionaire(questionnaire: HTMLElement) {
  console.log(questionnaire);
  //build wrapper-content
  let content: HTMLDivElement = makeDiv("wrapper-content");
  let children = questionnaire.children as HTMLCollection;
  // prepend question-overview
  let q_overview: HTMLDivElement = makeDiv("question-overview");
  q_overview.textContent = "Frage 1" + " von " + children.length;
  content.prepend(q_overview);
  // set attributes for QUESTIONNAIRE
  questionnaire.setAttribute("total_questions", "" + children.length);
  questionnaire.setAttribute("current_question", "1")
  // access children and append to wrapper-content
  for (let i = children.length - 1; i >= 0; i--) {
    content.append(children[i]);
  }
  questionnaire.prepend(content);
  //render Questions + Answers
  renderQuestions(questionnaire);
  renderAnswers(questionnaire);
  // build question footer
  let footer: HTMLDivElement = makeDiv("question-footer");
  content.append(footer);

  //build 2 buttons
  let prev_button: HTMLDivElement = makeDiv("change-question-button");
  let next_button: HTMLDivElement = makeDiv("change-question-button");
  prev_button.setAttribute("id", "prev_button");
  next_button.setAttribute("id", "next_button");
  prev_button.setAttribute("style","visibility:hidden;");
  prev_button.textContent = "prev";
  next_button.textContent = "next";
  prev_button.addEventListener("click", questionChangeHandler);
  next_button.addEventListener("click", questionChangeHandler);
  footer.append(prev_button, next_button);
}

//questionChangeHandler
//EventHandler -> DOM Manipulation
function questionChangeHandler(this: HTMLElement) {
  // get Questionnaire attributes
  let button = this.getAttribute("id");
  let questionnaire: HTMLElement = this.parentElement ?.parentElement ?.parentElement as HTMLElement;
  let min_qid: number = 0;
  let max_qid: number = parseInt(questionnaire.getAttribute("total_questions") as string) - 1;
  let current_qid: number = parseInt(questionnaire.getAttribute("current_question") as string) - 1;
  let questions = questionnaire.getElementsByTagName("question");

  // change question
  if (button == "prev_button") {
    questions[current_qid].removeAttribute("visible");
    questions[current_qid - 1].setAttribute("visible", "true");
    let str_current = current_qid.toString();
    questionnaire.setAttribute("current_question", str_current);
    questionnaire.getElementsByClassName("question-overview")[0].textContent = "Frage " + str_current + " von " + questions.length;
    //hide button if first question
    if (current_qid - 1 == min_qid) {
      this.setAttribute("style", "visibility:hidden;");
    }
    this.nextElementSibling ?.setAttribute("style", "visibility:visible;");
  }

  else if (button == "next_button") {
    questions[current_qid].removeAttribute("visible");
    questions[current_qid + 1].setAttribute("visible", "true");
    //change questionnaire attributes
    let str_current = (current_qid + 2).toString();
    questionnaire.setAttribute("current_question", str_current);
    //change question overview
    questionnaire.getElementsByClassName("question-overview")[0].textContent = "Frage " + str_current + " von " + questions.length;
    // hide button if last question
    if (current_qid + 1 == max_qid) {
      this.setAttribute("style", "visibility:hidden;");
    }
    this.previousElementSibling ?.setAttribute("style", "visibility:visible;");
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
function renderQuestions(questionnaire: HTMLElement) {
  // get wrapper-content
  let wrapper_content = questionnaire.firstChild as HTMLDivElement;
  let questions: HTMLCollection = questionnaire.getElementsByTagName("question");
  let lastIndex = questions.length - 1;
  questions[lastIndex].setAttribute("visible", "true");

  for (let i = lastIndex; i >= 0; i--) {
    let question: HTMLElement = questions[i] as HTMLElement;
    buildQuestionHeader(question);

    //append question to wrapper-content
    wrapper_content.append(question);
  }
}


// question->DOM Manipulation
// Question Text and CollapseAll-Functionality in question-header
function buildQuestionHeader(question: HTMLElement) {
  let text = question.getElementsByTagName("p")[0] as HTMLParagraphElement;
  let header: HTMLDivElement = document.createElement("div");
  header.setAttribute("class", "question-header");
  question.prepend(header);
  // append text and img
  let img = document.createElement("img");
  img.setAttribute("src", Ressources.plus_solid);
  img.addEventListener("click", ExplanationEventHandler.bind(img, true));
  header.append(text, img);
}

// questionnaire->DOM Manipulation
function renderAnswers(questionnaire: HTMLElement) {
  let answers: HTMLCollection = questionnaire.getElementsByTagName("answer");
  //for every answer:
  // add <div> wrapper + <img>-icon (done)
  // add EventListener for AnswerClickEvents (done)
  for (let i = answers.length - 1; i >= 0; i--) {
    let answer: HTMLElement = answers[i] as HTMLElement;
    // build div-wrapper
    let new_div: HTMLDivElement = document.createElement("div");
    let text = document.createElement("p");
    text.innerHTML = (answer.childNodes[0] as Text).data;
    answer.childNodes[0].remove();
    new_div.setAttribute("class", "wrapper-answer");
    answer.prepend(new_div);
    //append text and img
    let img = document.createElement("img");
    img.setAttribute("src", Ressources.circle_regular);
    new_div.append(img, text);
    answer.addEventListener("click", checkAnswer);
    answer.addEventListener("click", ExplanationEventHandler.bind(answer, false));
  }
}
// ExplanationEventHandler
// Handles Events for shoowing explanation text
function ExplanationEventHandler(this: HTMLElement, collapse: boolean) {
  if (collapse == true) {
    let question: HTMLElement = this.parentElement ?.parentElement as HTMLElement;
    let answers: HTMLCollection = question.getElementsByTagName("answer") as HTMLCollection;
    //change icons and collapse
    if (this.getAttribute("clicked") == "true") {
      this.setAttribute("src", Ressources.plus_solid);
      this.setAttribute("clicked", "false");
      for (let i = answers.length - 1; i >= 0; i--) {
        let answer = answers[i] as HTMLElement;
        answer.getElementsByTagName("explanation")[0].removeAttribute("visible");
      }
    }
    else {
      this.setAttribute("src", Ressources.minus_solid);
      this.setAttribute("clicked", "true");
      for (let i = answers.length - 1; i >= 0; i--) {
        let answer = answers[i] as HTMLElement;
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
function showExplanation(answer: HTMLElement) {
  let explanation: HTMLElement = answer.getElementsByTagName("explanation")[0] as HTMLElement;
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
function checkAnswer(this: HTMLElement) {
  let question_type = this.parentElement ?.getAttribute("type");
  if (question_type == "multiplechoice") {
    showAnswer(this);
  }
  else if (question_type == "singlechoice") {
    let answers = this.parentElement ?.getElementsByTagName("answer") as HTMLCollection;
    for (let i = answers ?.length - 1; i >= 0; i--) {
      let answer: HTMLElement = answers[i] as HTMLElement;
      showAnswer(answer);

    }
  }
}

// showAnswer
// show icons and highlight answer

function showAnswer(answer: HTMLElement) {
  answer.setAttribute("clicked", "true");
  let img = answer.getElementsByTagName("img")[0];
  if (answer.getAttribute("correct") == "true") {
    img.setAttribute("src", Ressources.check_solid);
  }
  else {
    img.setAttribute("src", Ressources.xmark_solid);
  }
}

// makeDiv
// ClassName as String -> HTMLDivElement
function makeDiv(css_name: string) {
  let new_div = document.createElement("div");
  new_div.setAttribute("class", css_name);
  return new_div;
}

// swipeEvent
// const divContainer = document.getElementById("touch-event-test");
// divContainer.addEventListener("")
// function (){
//
// }
