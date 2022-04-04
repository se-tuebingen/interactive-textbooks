// #### QUESTIONNAIRE MODULE ####
// This module implements the questionnaire functionality

// <questionnaire> <- List of questions
//   <question type="multiplechoice|singlechoice">
//     Question Text
//     <answer correct="true|false">
//       Answer Text
//       <explanation>Explanation Text
interface Questionnaire {
  rootElement: HTMLElement;
  questions: Question[];
};

type Questiontype = "singlechoice" | "multiplechoice";

interface Question {
  type: Questiontype;
  text: Node[];
  answers: Answer[];
};

interface Answer {
  correct: boolean;
  text: Node[];
  explanation?: HTMLElement;
}

// ########### PARSE METHODS

function parseQuestionnaire(questionnaire: HTMLElement): Questionnaire {
  return {
    rootElement: questionnaire,
    questions: Array.from(questionnaire.children as HTMLCollection).map(x => parseQuestion(x as HTMLElement))
  };
}

function parseQuestion(question: HTMLElement): Question {
  const type = question.getAttribute('type') as Questiontype;
  const text = Array.from(question.childNodes as NodeList)
    .filter(x => (x as HTMLElement).tagName != 'ANSWER');
  const answers = Array.from(question.getElementsByTagName('answer') as HTMLCollection);
  return {
    type: type,
    text: text,
    answers: answers.map(x => parseAnswer(x as HTMLElement))
  };
}

function parseAnswer(answer: HTMLElement): Answer {
  const correct = (answer.getAttribute('correct') as string) == 'true';
  const text = Array.from(answer.childNodes as NodeList)
    .filter(x => (x as HTMLElement).tagName != 'EXPLANATION');
  const explanation = answer.getElementsByTagName('explanation')[0] as HTMLElement;
  return {
    correct: correct,
    text: text,
    explanation: explanation
  };
}

function setup() {
  // setup style
  const styleNode = document.createElement('style');
  styleNode.innerHTML = Ressources.style;
  document.getElementsByTagName('head')[0].appendChild(styleNode);
  const q_col: HTMLCollection = document.getElementsByTagName("questionnaire") as HTMLCollection;
  // render every questionnaire in the HTML Document
  for (let i = q_col.length - 1; i >= 0; i--) {
    const questionnaire: HTMLElement = q_col[i] as HTMLElement;
    const r = parseQuestionnaire(questionnaire);
    console.log(r);
    renderQuestionnaire(r);
  }
}
window.onload = setup;

// render questionnaire:
// addEventListener for "click"-Events
// build wrapper-<div> and <img>-icons for
// - answer
// - question

// ### RENDER FUNCTIONS ###
function renderQuestionnaire(questionnaire: Questionnaire) {
  const root = questionnaire.rootElement;
  root.setAttribute("total_questions", "" + questionnaire.questions.length);
  root.setAttribute("current_question", "1");

  const overview_text = hideContext("overview_text");
  const buttons = hideContext("buttons");

  root.innerHTML = `
    <div class="content-wrapper">
      <div class="question-overview">
      ${overview_text}
      </div>
      ${questionnaire.questions.reverse().map(renderQuestion)}
      <div class="question-footer">
      ${buttons}
      </div>
    </div>
  `;
// Local functions
  function hideContext(pos: string) {
    switch (pos) {
      // if only one question exists, ignore question overview text
      case "overview_text":
        if (questionnaire.questions.length == 1) {
          return "";
        }
        else {
          return `Question 1 of ${questionnaire.questions.length}`;
        }
      // if only one question exists, ignore "prev", "next" buttons.
      case "buttons":
        if (questionnaire.questions.length == 1) {
          return "";
        }
        else {
          return `
          <div class="change-question-button"
               id="prev_button"
               style="visibility:hidden;"
               onclick="questionChangeHandler(event)">
               prev
          </div>
          <div class="change-question-button"
               id="next_button"
               onclick="questionChangeHandler(event)">
               next
          </div>
          `;
        }
      default:
        break;
    }
  }
}
// function renderQuestionaire(questionnaire: HTMLElement) {
//   console.log(questionnaire);
//   //build wrapper-content
//   let content: HTMLDivElement = makeDiv("content-wrapper");
//   let questions = questionnaire.children as HTMLCollection;
//   let question_number: number = questions.length;
//   // access children and append to wrapper-content
//   for (let i = question_number - 1; i >= 0; i--) {
//     content.append(questions[i]);
//   }
//   questionnaire.prepend(content);
//   buildQuestionOverview(questionnaire, content, question_number);
//   //render Questions + Answers
//   renderQuestions(questionnaire);
//   renderAnswers(questionnaire);
//   buildQuestionnaireFooter(content, question_number);
// }
// function buildQuestionOverview(questionnaire:HTMLElement, content: HTMLDivElement, question_number:number){
//   // question-overview
//   let q_overview: HTMLDivElement = makeDiv("question-overview");
//   q_overview.textContent = "Frage 1" + " von " + question_number;
//   content.prepend(q_overview);
//   // question-current-total initial
//   questionnaire.setAttribute("total_questions", "" + question_number);
//   questionnaire.setAttribute("current_question", "1")
// }
// // build questionnaire footer
// // if only one question: BUILD NO BUTTON
// function buildQuestionnaireFooter(content:HTMLDivElement, question_number:number){
//   if (question_number == 1) {
//     //BUILD NOTHING
//   }
//   else {
//     let footer: HTMLDivElement = makeDiv("question-footer");
//     content.append(footer);
//     buildFooterButtons(footer);
//   }
// }

//build 2 buttons: "prev"-Question, "next"-Question
// function buildFooterButtons(footer: HTMLDivElement) {
//   let prev_button: HTMLDivElement = makeDiv("change-question-button");
//   let next_button: HTMLDivElement = makeDiv("change-question-button");
//   prev_button.setAttribute("id", "prev_button");
//   next_button.setAttribute("id", "next_button");
//   prev_button.setAttribute("style", "visibility:hidden;");
//   prev_button.textContent = "prev";
//   next_button.textContent = "next";
//   prev_button.addEventListener("click", questionChangeHandler);
//   next_button.addEventListener("click", questionChangeHandler);
//   footer.append(prev_button, next_button);
// }

// renderQuestions
// for every question:
// add <div>-wrapper + <img>-icon (done)
// add EventListener for CollapseAll-Function
function renderQuestion(question: Question, index: number) {
  return `
    <question type="${question.type}" ${index == 0 ? 'visible="true"' : ''}>
      <div class="question-header">
        <p>${question.text.map(nodeOuterHTML).join('')}</p>
        <img src="${Ressources.plus_solid}" onclick="explanationEventHandler.bind(event.target.el, true)">
      </div>
      ${question.answers.map(renderAnswer).join('')}
    </question>
  `;
}
// function renderQuestions(questionnaire: HTMLElement) {
//   // get wrapper-content
//   let wrapper_content = questionnaire.firstChild as HTMLDivElement;
//   let questions: HTMLCollection = questionnaire.getElementsByTagName("question");
//   let lastIndex = questions.length - 1;
//   questions[lastIndex].setAttribute("visible", "true");
//
//   for (let i = lastIndex; i >= 0; i--) {
//     let question: HTMLElement = questions[i] as HTMLElement;
//     buildQuestionHeader(question);
//
//     //append question to wrapper-content
//     wrapper_content.append(question);
//   }
// }
//
//
// // question->DOM Manipulation
// // Question Text and CollapseAll-Functionality in question-header
// function buildQuestionHeader(question: HTMLElement) {
//   let text = document.createElement("p");
//   text.innerHTML = (question.childNodes[0] as Text).data;
//   question.childNodes[0].remove();
//   let header: HTMLDivElement = document.createElement("div");
//   header.setAttribute("class", "question-header");
//   question.prepend(header);
//   // append text and img
//   let img = document.createElement("img");
//   img.setAttribute("src", Ressources.plus_solid);
//   img.addEventListener("click", explanationEventHandler.bind(img, true));
//   header.append(text, img);
// }
function renderAnswer(answer: Answer) {
  return `
  <answer correct="${answer.correct ? 'true' : 'false'}">
    <div class="wrapper-answer" onclick="clickAnswerHandler(event)">
      <img src="${Ressources.circle_regular}">
      <p>
        ${answer.text.map(nodeOuterHTML).join('')}
      </p>
      ${answer.explanation ?.outerHTML}
    </div>
  </answer>
  `;
}

function nodeOuterHTML(x: Node) {
  const outerHTML = (x as HTMLElement).outerHTML;
  if (outerHTML == undefined) {
    const data = (x as Text).data;
    if (data == undefined) {
      return '';
    }
    return data;
  }
  console.log("outerHTML:" + outerHTML);
  return outerHTML;
}

// // questionnaire->DOM Manipulation
// function renderAnswers(questionnaire: HTMLElement) {
//   let answers: HTMLCollection = questionnaire.getElementsByTagName("answer");
//   //for every answer:
//   // add <div> wrapper + <img>-icon (done)
//   // add EventListener for AnswerClickEvents (done)
//   for (let i = answers.length - 1; i >= 0; i--) {
//     let answer: HTMLElement = answers[i] as HTMLElement;
//     // build div-wrapper
//     let new_div: HTMLDivElement = document.createElement("div");
//     let text = document.createElement("p");
//     text.innerHTML = (answer.childNodes[0] as Text).data;
//     answer.childNodes[0].remove();
//     new_div.setAttribute("class", "wrapper-answer");
//     answer.prepend(new_div);
//     //append text and img
//     let img = document.createElement("img");
//     const mode = answer.parentElement?.getAttribute("type");
//     img.setAttribute("src", mode === 'singlechoice' ? Ressources.circle_regular : Ressources.square_regular);
//     new_div.append(img, text);
//     answer.addEventListener("click", checkAnswerEventHandler);
//     answer.addEventListener("click", explanationEventHandler.bind(answer, false));
//   }
// }
//
// makeDiv
// ClassName as String -> HTMLDivElement
function makeDiv(css_name: string) {
  let new_div = document.createElement("div");
  new_div.setAttribute("class", css_name);
  return new_div;
}
// getTagRecursive from a child element
// if element has TagName
// return;
// else: retry with parentElement

function getTagRecursive(el: HTMLElement, tag: string) {
  console.log(el);
  if (el.tagName == tag.toUpperCase()) {
    return el;
  }
  else {
    let parent: HTMLElement = el.parentElement as HTMLElement;
    let result = getTagRecursive(parent, tag) as HTMLElement;
    return result;
  }
}

// ### EVENT HANDLER FUNCTIONS ###

// EVENT AFTER BUTTON "prev" OR "next" CLICK
// questionChangeHandler
// EventHandler -> DOM Manipulation
function questionChangeHandler(event: Event) {
  // get Questionnaire attributes
  let el: HTMLElement = event.target as HTMLElement;
  let button = el.getAttribute("id");
  let questionnaire: HTMLElement = getTagRecursive(el, "questionnaire") as HTMLElement;
  let total_questions: number = parseInt(questionnaire.getAttribute("total_questions") as string);
  let current_question: number = parseInt(questionnaire.getAttribute("current_question") as string);
  let questions = questionnaire.getElementsByTagName("question");
  let min_qid: number = 0;
  let max_qid: number = total_questions - 1;
  let qid = current_question - 1;
  // change question
  // if button is "prev"
  switch (button) {
    case "prev_button":
      let prev_qid = current_question - 1;
      // change visibility to the previous question
      questions[qid].removeAttribute("visible");
      questions[qid - 1].setAttribute("visible", "true");
      // change question overview text
      questionnaire.setAttribute("current_question", prev_qid.toString());
      questionnaire.getElementsByClassName("question-overview")[0].textContent = "Question " + prev_qid.toString() + " of " + total_questions;
      //hide button if button to first question
      if (prev_qid - 1 == min_qid) {
        el.setAttribute("style", "visibility:hidden;");
      }
      // show next-Button
      el.nextElementSibling ?.setAttribute("style", "visibility:visible;");
      break;

    case "next_button":
      let next_qid = qid + 1;
      questions[qid].removeAttribute("visible");
      questions[next_qid].setAttribute("visible", "true");
      //change question overview text
      questionnaire.setAttribute("current_question", (current_question + 1).toString());
      questionnaire.getElementsByClassName("question-overview")[0].textContent = "Question " + (current_question + 1).toString() + " of " + total_questions;
      // hide button if button to last question
      if (next_qid == max_qid) {
        el.setAttribute("style", "visibility:hidden;");
      }
      //show prev_button
      el.previousElementSibling ?.setAttribute("style", "visibility:visible;");
      break;

    default:
      console.log("No Button caused this EventHandler", button);
      break;
  }


}



// ExplanationEventHandler
// Handles Events for shoowing explanation text
function explanationEventHandler(el: HTMLElement, collapse: boolean) {
  if (collapse == true) {
    let question: HTMLElement = getTagRecursive(el, "question") as HTMLElement;
    let answers: HTMLCollection = question.getElementsByTagName("answer") as HTMLCollection;
    //change icons and collapse
    if (el.getAttribute("clicked") == "true") {
      el.setAttribute("src", Ressources.plus_solid);
      //  this.setAttribute("clicked", "false");
      for (let i = answers.length - 1; i >= 0; i--) {
        let answer = answers[i] as HTMLElement;
        answer.getElementsByTagName("explanation")[0].removeAttribute("visible");
      }
    }
    else {
      el.setAttribute("src", Ressources.minus_solid);
      el.setAttribute("clicked", "true");
      for (let i = answers.length - 1; i >= 0; i--) {
        let answer = answers[i] as HTMLElement;
        answer.getElementsByTagName("explanation")[0].setAttribute("visible", "true");
      }
    }
  }
  else {
    let answer = getTagRecursive(el, "answer");
    showExplanation(answer);
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

// unified click on answer event handler
function clickAnswerHandler(event: Event) {
  const el = event.target as HTMLElement;
  checkAnswerEventHandler(el);
  explanationEventHandler(el, false);
} //: Event) {
// console.log('clicked clickAnswerHandler');
// console.log(this);
// const el = this.target as HTMLElement;
// console.log(el);
// checkAnswerEventHandler.bind(el);
// explanationEventHandler.bind(el, false);
//}

// check click for correct answer
// depending on question type show either
// - for multiplechoice just clicked answer
// - for singlechoice all answers
function checkAnswerEventHandler(el: HTMLElement) {
  let question_type = getTagRecursive(el, "question").getAttribute("type");
  if (question_type == "multiplechoice") {
    let answer = getTagRecursive(el, "answer");
    showAnswer(answer);
  }
  else if (question_type == "singlechoice") {
    let answers = getTagRecursive(el, "question").getElementsByTagName("answer") as HTMLCollection;
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


// swipeEvent
// const divContainer = document.getElementById("touch-event-test");
// divContainer.addEventListener("")
// function (){
//
// }
