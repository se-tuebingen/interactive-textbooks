#lang scribble/manual

@(require "questionnaire.rkt")
@(require pict) @; for testing picture rendering

@title[#:version ""]{Questionnaire test manual}
@author["Florian Kellner"]

This manual aims to cover most possible valid configurations.

@table-of-contents[]

@section{Single-Choice and Multiple Choice}

Single-Choice Question:

@questionnaire[#:key "singlechoicetest"
@question[
  "singlechoice"
  "What is this course about?"
  @distractor["Learning to swim"]
  @explanation["We do not have a pool"
  ]
  @distractor["Learning to sing"]
  @explanation["Singing is hard with masks on or network latency"
  ]
  @solution[
    "Learning to program"]
    @explanation["You are sitting at a computer, aren't you?"
  ]
]
]

Multiple-Choice-Question (in the pdf, the solution should be below and not in the margin, here):

@questionnaire[ #:texsolutionstyle "inline"
@question["multiplechoice"
  "What does TS stand for?"
  @solution["TeamSpeak"]
  @explanation["etc"]
  @distractor["Torus Examination"]
  @explanation["although technically..."]
  @solution["TypeScript"]
  @explanation["Yup"]
]
]

In latex, the questions should be rendered below:
@texquestions[#:key "singlechoicetest"]
@texquestions[]

@section{More than one Question}

Questionnaire with several questions:

@questionnaire[
@question["multiplechoice"
  "What does TS stand for?"
  @solution["TeamSpeak"]
  @explanation["etc"]
  @distractor["Torus Examination"]
  @explanation["although technically..."]
  @solution["TypeScript"]
  @explanation["Yup"]
]
@question[
  "singlechoice"
  "What is this course about?"
  @distractor["Learning to swim"]
  @explanation["We do not have a pool"
  ]
  @distractor["Learning to sing"]
  @explanation["Singing is hard with masks on or network latency"
  ]
  @solution[
    "Learning to program"]
    @explanation["You are sitting at a computer, aren't you?"
  ]
]
  @question["singlechoice"
    "Why is this happening?"
    @distractor["Yes"]
    @explanation["But actually no"
    ]
    @distractor["No"]
    @explanation["But actually yes"
    ]
    @solution["Goat"]
    @explanation["Whatever floats your goat"
    ]
  ]
]

@texquestions[]

@section{Moving questions to another section}

In the pdf version, we should see the "What is this course about?" question here again, in the HTML version, it is "What does TS stand for":

@texquestions[#:key "singlechoicetest"]
@questionnaire[ #:nolatex #t
  @question["multiplechoice"
    "What does TS stand for?"
    @solution["TeamSpeak"]
    @explanation["etc"
    ]
    @distractor["Torus Examination"]
    @explanation["although technically..."
    ]
    @solution["TypeScript"]
    @explanation["Yup"
    ]
  ]
]
