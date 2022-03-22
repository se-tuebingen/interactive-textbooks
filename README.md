# interactive-textbooks

## What is this Repository?

This is sort of an exchange playground for Linus and Florian to develop
HTML/JS Modules for use in lecture materials.

## How to compile

Executing `tsc` in project root creates the single-file drop-in questionnaire module from the `src` folder.

Because the goal is to provide on single JavaScript file, Styles and SVG icons are provided as String ressources in `ressources.ts`.
This module is generated from the contents of the `ressources` folder (`style.css` and the `svg`-files in the `icons` folder) by running `bundle-ressources.sh`.
So any changes in those files are only applied after running this script!


## How to use

### JavaScript module

In order to use the JavaScript module, one only needs to create HTML in the correct format and include the script somewhere on the page:
```html
<questionnaire>
  <question type="singlechoice"><!-- or multiplechoice-->
    Question Text
    <answer correct="false">
      Answer Text
      <explanation>Explanation Text</explanation>
    </answer>
    <!-- etc.. -->
  </question>
  <!-- etc. ... -->
</questionnaire>

<!-- somewhere else in the same document -->
<script src="questionnaire.js"></script>
```

### Scribble-Plugin

Copy the plugin to your source folder and import it with
```scribble
@(require "questionnaire.rkt")
```

You can generate your questions in the same style as in the HTML document:
```scribble
@questionnaire{
  @question["singlechoice"]{ @; or multiplechoice
    Question Text
    @answer[#t]{
      correct answer
      @explanation{Explanation}
    }
  }
}
```

On each page, you need to generate the script tag that loads the JavaScript module:
```scribble
@; it does not matter where, as long as it is on the same output page - usually there is one HTML document per section
@setup-questionnaire
```

After compiling your HTML output, you need to copy `questionnaire.js` to the output folder.

## Tests

- `questionnaire-test.html` loads the JavaScript plugin into a plain HTML page.
- Running `test.sh` in the `scribble-plugin` folder tests the Scribble plugin and generates PDF- and HTML output.

## Todos

- (beide, done) Scribbl installieren
- (beide, done) TypeScript installieren
- (beide, done) Entwurf für HTML-Interface überlegen
- (Linus) CSS-Layout
- (Linus)TS-Code, damit das ganze tut
- (Flo) Scribbl-Modul schreiben

<!--
<questionnaire>
  <question type="multiplechoice">
    Thank you for your interest, do you have any questions regarding the questionnaire module?
    <answer correct="true">
      Yes
      <explanation>
        Feel free to open up an issue and reach out!
      </explanation>
    </answer>
    <answer correct="true">
      No
      <explanation>
        Have a nice day!
      </explanation>
    </answer>
  </question>
</questionnaire>

<script src="dist/questionnaire.js"></script>-->
