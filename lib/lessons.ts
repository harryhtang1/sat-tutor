export interface Concept {
  title: string;
  explanation: string;
  example: string;
}

export interface Lesson {
  intro: string;
  concepts: Concept[];
}

export const LESSONS: Record<string, Lesson> = {
  // ── Math ──────────────────────────────────────────────────────────────────

  algebra: {
    intro:
      "Algebra is the largest domain on SAT Math, covering roughly 35% of questions. You'll work with linear equations, inequalities, systems of equations, and functions — often set in real-world contexts. Mastering how to set up and solve equations efficiently is the single highest-leverage skill on the entire test.",
    concepts: [
      {
        title: "Linear Equations",
        explanation:
          "A linear equation has variables raised only to the first power. Solve by performing the same inverse operation on both sides until the variable is isolated. Always simplify each side before moving terms across the equals sign.",
        example: "Solve 3x − 7 = 14\n→ Add 7:   3x = 21\n→ Divide:   x = 7",
      },
      {
        title: "Systems of Equations",
        explanation:
          "A system is two equations with the same two unknowns. Use substitution (express one variable in terms of the other, then substitute) or elimination (add or subtract equations to cancel a variable). The SAT favours whichever method reaches the answer in fewer steps.",
        example:
          "x + y = 5\nx − y = 1\n→ Add both:  2x = 6  →  x = 3\n→ Substitute: y = 2",
      },
      {
        title: "Linear Inequalities",
        explanation:
          "Solve inequalities exactly like equations, with one critical rule: flip the inequality sign whenever you multiply or divide both sides by a negative number. Graphically, < and > use open circles; ≤ and ≥ use closed circles.",
        example: "Solve −2x + 4 < 10\n→ −2x < 6\n→ Divide by −2 (flip!):  x > −3",
      },
      {
        title: "Functions and Function Notation",
        explanation:
          "A function maps each input to exactly one output. f(x) is read 'f of x' — replace x with the given value to evaluate it. The SAT may ask you to evaluate f(3), solve for x when f(x) = 0, or interpret f in a word-problem context.",
        example: "f(x) = 2x² − 3\nf(4) = 2(16) − 3 = 32 − 3 = 29\nIf f(x) = 15:  2x² = 18  →  x = ±3",
      },
      {
        title: "Slope and Intercepts",
        explanation:
          "Slope-intercept form y = mx + b gives the slope m (rise over run) and y-intercept b directly. Point-slope form y − y₁ = m(x − x₁) is fastest when you know a point and the slope. Two parallel lines have equal slopes; perpendicular lines have slopes that are negative reciprocals.",
        example:
          "Line through (1, 2) and (3, 8)\nSlope = (8−2)/(3−1) = 6/2 = 3\ny − 2 = 3(x − 1)  →  y = 3x − 1",
      },
    ],
  },

  "advanced-math": {
    intro:
      "Advanced Math accounts for about 28% of SAT Math questions and covers nonlinear algebra: quadratics, polynomials, exponential functions, and rational expressions. These problems often require multiple steps and the ability to move fluidly between different forms of the same expression.",
    concepts: [
      {
        title: "Quadratic Equations",
        explanation:
          "A quadratic has the form ax² + bx + c = 0. Solve by factoring (fastest when possible), completing the square, or applying the quadratic formula x = (−b ± √(b²−4ac)) / 2a. The discriminant b²−4ac tells you how many real solutions exist: positive → two, zero → one, negative → none.",
        example:
          "x² − 7x + 12 = 0\nFactor: (x − 3)(x − 4) = 0\n→ x = 3  or  x = 4",
      },
      {
        title: "Polynomial Operations",
        explanation:
          "Polynomials are added or subtracted by combining like terms. Multiply using the distributive property (FOIL for two binomials). To divide a polynomial by (x − a), synthetic division or the factor theorem shortcut — if plugging in a gives 0, (x − a) is a factor.",
        example:
          "(2x + 3)(x − 5)\n= 2x² − 10x + 3x − 15\n= 2x² − 7x − 15",
      },
      {
        title: "Exponential Functions",
        explanation:
          "An exponential function has the form f(x) = a · bˣ where a is the starting value and b is the growth/decay factor. If b > 1 the function grows; if 0 < b < 1 it decays. The SAT commonly asks you to identify these from context — 'decreases by 8% each year' means b = 0.92.",
        example:
          "Population starts at 500, grows 20%/year\nP(t) = 500 · (1.20)ᵗ\nAfter 3 years: 500 · 1.728 = 864",
      },
      {
        title: "Rational Expressions",
        explanation:
          "A rational expression is a fraction with polynomials in the numerator and/or denominator. Simplify by factoring both and cancelling common factors. Adding or subtracting rational expressions requires a common denominator, just like numeric fractions.",
        example:
          "(x² − 9) / (x + 3)\n= (x + 3)(x − 3) / (x + 3)\n= x − 3   (valid for x ≠ −3)",
      },
      {
        title: "Radicals and Rational Exponents",
        explanation:
          "Roots and exponents are interchangeable: √x = x^(1/2), ∛x = x^(1/3), and in general x^(m/n) = (ⁿ√x)ᵐ. Simplify radical expressions by factoring out perfect squares (or cubes). The SAT may present the same expression in both forms — convert to whichever is easier to work with.",
        example:
          "Simplify √48\n= √(16 · 3) = 4√3\n\nx^(2/3) = (∛x)² or ∛(x²)",
      },
    ],
  },

  "problem-solving-data": {
    intro:
      "Problem-Solving and Data Analysis makes up about 15% of SAT Math questions. It tests quantitative reasoning in real-world contexts: ratios and proportions, percentage calculations, statistical measures, and the ability to read and draw conclusions from data displays like tables and scatter plots.",
    concepts: [
      {
        title: "Ratios, Rates, and Proportions",
        explanation:
          "A ratio compares two quantities; a rate compares quantities with different units (e.g., miles per hour). Proportions — two equal ratios — are solved by cross-multiplication. Unit conversion chains multiply by fractions equal to 1 to cancel unwanted units.",
        example:
          "If 5 notebooks cost $12.50, how much do 8 cost?\n12.50/5 = x/8\nx = 8 × 2.50 = $20.00",
      },
      {
        title: "Percentages and Percent Change",
        explanation:
          "Percent of a value: multiply by the decimal form (35% of 80 = 0.35 × 80). Percent change = (new − old) / old × 100. For multi-step percent problems, apply each factor in sequence — they do not simply add.",
        example:
          "Price: $120 → 25% off → then 10% off\nAfter 25%: 120 × 0.75 = $90\nAfter 10%: 90 × 0.90 = $81\n(NOT 120 × 0.65 = $78 — common mistake!)",
      },
      {
        title: "Statistics: Mean, Median, and Spread",
        explanation:
          "Mean is the arithmetic average (sum ÷ count); median is the middle value of a sorted list (or average of the two middle values when count is even); mode is the most frequent value. Range and standard deviation measure spread — a larger standard deviation means data is more scattered around the mean.",
        example:
          "Data: 2, 5, 7, 7, 9\nMean = (2+5+7+7+9)/5 = 30/5 = 6\nMedian = 7  (middle value)\nMode = 7   (appears twice)",
      },
      {
        title: "Data Interpretation",
        explanation:
          "SAT data questions use tables, bar charts, scatter plots, and two-way frequency tables. Always check what the axes measure and what units are used. For scatter plots, identify whether the association is positive, negative, or none, and whether the relationship looks linear or curved.",
        example:
          "Scatter plot: x = study hours, y = score\nPositive linear association → more study time correlates with higher scores\nBest-fit line at x=5: predict y ≈ 82",
      },
      {
        title: "Probability",
        explanation:
          "Probability = (number of favourable outcomes) / (total outcomes). For two independent events, P(A and B) = P(A) × P(B). For mutually exclusive events, P(A or B) = P(A) + P(B). Conditional probability P(A | B) = P(A and B) / P(B).",
        example:
          "Bag: 4 red, 6 blue marbles\nP(red) = 4/10 = 0.4\nP(red then red, no replacement)\n= 4/10 × 3/9 = 12/90 ≈ 0.133",
      },
    ],
  },

  "geometry-trigonometry": {
    intro:
      "Geometry and Trigonometry account for about 15% of SAT Math. You'll use properties of lines, angles, triangles, circles, and basic right-triangle trigonometry. Key formulas (area, volume, special triangles) are provided in the test reference sheet — so the focus is on knowing when and how to apply them, not memorising them.",
    concepts: [
      {
        title: "Angle Relationships",
        explanation:
          "Vertical angles (formed by two intersecting lines) are always equal. Angles on a straight line sum to 180°. Interior angles of any triangle sum to 180°. When a transversal crosses parallel lines, corresponding angles are equal and alternate interior angles are equal — these facts unlock almost every multi-angle problem.",
        example:
          "Two parallel lines cut by a transversal\nAlternate interior angles: both = 65°\nCo-interior (same-side): 65° + 115° = 180°",
      },
      {
        title: "Triangle Properties",
        explanation:
          "The exterior angle of a triangle equals the sum of the two non-adjacent interior angles. Similar triangles have proportional sides and equal angles. The triangle inequality states that the sum of any two sides must exceed the third side.",
        example:
          "Exterior angle = 110°\nTwo interior angles: 60° and x\n60 + x = 110  →  x = 50°",
      },
      {
        title: "The Pythagorean Theorem",
        explanation:
          "In any right triangle, a² + b² = c² where c is the hypotenuse (opposite the right angle). Memorise common Pythagorean triples: 3-4-5, 5-12-13, 8-15-17, and their multiples. The 45-45-90 and 30-60-90 special triangles are on the reference sheet.",
        example:
          "Legs: 9 and 12\nc² = 81 + 144 = 225\nc = √225 = 15\n(a 3-4-5 triple scaled by 3)",
      },
      {
        title: "Trigonometry: SOH-CAH-TOA",
        explanation:
          "In a right triangle: sin(θ) = opposite/hypotenuse, cos(θ) = adjacent/hypotenuse, tan(θ) = opposite/adjacent. The SAT also tests the co-function identity: sin(θ) = cos(90° − θ). Inverse trig (sin⁻¹, cos⁻¹, tan⁻¹) finds angles from ratios.",
        example:
          "Right triangle: opposite = 5, hypotenuse = 13\nsin(θ) = 5/13 ≈ 0.385\nθ = sin⁻¹(5/13) ≈ 22.6°",
      },
      {
        title: "Circles",
        explanation:
          "Circumference = 2πr, Area = πr². Arc length = (θ/360°) × 2πr and sector area = (θ/360°) × πr², where θ is the central angle in degrees. A central angle equals its intercepted arc; an inscribed angle equals half the intercepted arc.",
        example:
          "Circle radius = 6, central angle = 120°\nArc length = (120/360) × 2π(6) = 4π ≈ 12.6\nSector area = (120/360) × π(36) = 12π ≈ 37.7",
      },
    ],
  },

  // ── Reading & Writing ───────────────────────────────────────────────────

  "information-ideas": {
    intro:
      "Information and Ideas is the largest Reading & Writing domain, covering roughly 26% of questions. It tests your ability to closely read literary and informational texts: finding the central idea, identifying supporting evidence, making valid inferences, and integrating information from accompanying data visuals.",
    concepts: [
      {
        title: "Central Idea and Purpose",
        explanation:
          "The central idea is the author's primary point — what the entire passage is fundamentally about. It is often (but not always) stated explicitly. When answering 'main idea' questions, eliminate choices that are too narrow (a specific detail) or too broad (they go beyond the passage's scope).",
        example:
          "Wrong: 'The passage is about Thomas Edison.' (too narrow — a detail)\nWrong: 'The passage is about all inventors.' (too broad)\nRight: 'The passage argues that Edison succeeded through systematic experimentation.'",
      },
      {
        title: "Textual Evidence",
        explanation:
          "Evidence questions ask which quote best supports a given conclusion. The correct evidence must directly and specifically address the claim — not merely be on the same topic or from the same paragraph. Test each option: does it actually prove the statement, or only relate to it?",
        example:
          "Claim: 'The author thinks cities are environmentally harmful.'\nWeak: 'Cities have millions of residents.' (relevant topic, weak support)\nStrong: 'Urban areas produce 70% of global CO₂ emissions.' (directly proves it)",
      },
      {
        title: "Making Inferences",
        explanation:
          "An inference is a logical conclusion that follows from what the passage states, even if it is not directly said. A valid SAT inference is always well-supported by explicit text. Avoid inferences that require outside knowledge, assume motivation, or go further than the evidence allows.",
        example:
          "Text: 'She ordered coffee but barely touched it.'\nValid inference: She didn't want the coffee (or was distracted).\nInvalid: She disliked coffee. (too specific — we don't know why she didn't drink it)",
      },
      {
        title: "Relationships Between Ideas",
        explanation:
          "Authors structure arguments using relationships: cause and effect, compare and contrast, problem and solution, claim and evidence. Signal words reveal these relationships — 'however' signals contrast; 'therefore' signals a conclusion; 'for example' introduces evidence.",
        example:
          "'Despite decades of investment in renewable energy, global fossil fuel consumption has continued to rise.'\n→ Contrast relationship: investment (cause) did NOT produce expected effect.",
      },
      {
        title: "Quantitative Evidence",
        explanation:
          "Some passages include a chart, graph, or table. These questions ask you to integrate the visual data with the written text. A correct answer will accurately represent both. Watch for answer choices that correctly describe the chart but contradict the passage, or vice versa.",
        example:
          "Chart shows sales rose 2018–2020, then fell.\nPassage says 'consistent growth throughout the period.'\n→ The passage's claim is NOT supported by the data.",
      },
    ],
  },

  "craft-structure": {
    intro:
      "Craft and Structure questions make up about 28% of Reading & Writing. They ask how authors build meaning through word choice, text organisation, and point of view. You'll interpret vocabulary in context, identify how a text is structured, analyse an author's purpose, and on some questions compare how two authors approach the same topic.",
    concepts: [
      {
        title: "Words in Context",
        explanation:
          "Vocabulary questions ask for the meaning of a word or phrase as it is used in the passage — not its dictionary definition. Go back to the sentence, cover the word, and predict what would fit. Then choose the option closest to your prediction. Many words have multiple meanings; context determines which applies.",
        example:
          "'The scientist's work proved seminal to the field.'\nSeminal can mean 'relating to seeds' OR 'highly influential.'\nContext → 'highly influential' is the intended meaning.",
      },
      {
        title: "Text Structure",
        explanation:
          "Recognising how a passage is organised helps you locate information and understand the author's strategy. Common structures: chronological order, compare and contrast, cause and effect, problem and solution, and claim + evidence. Transition words are your map to identifying structure.",
        example:
          "Structure clues:\n'First… then… finally' → chronological\n'On the one hand… on the other' → compare/contrast\n'As a result… therefore' → cause/effect",
      },
      {
        title: "Author's Purpose and Point of View",
        explanation:
          "Always ask: why did the author write this, and what is their perspective? An author informing a general audience writes differently from one arguing a position in an academic journal. Point of view is revealed through word choice — evaluative adjectives ('alarming,' 'promising') signal the author's stance.",
        example:
          "'The policy, though well-intentioned, has produced alarming consequences.'\n→ Author's POV: the policy is problematic despite good intentions.\n→ Purpose: to critique or argue against the policy.",
      },
      {
        title: "Figurative Language",
        explanation:
          "Figurative language conveys meaning beyond literal words. Metaphors and similes create comparisons; personification gives human qualities to non-human things; irony says the opposite of what is meant. SAT questions ask what a figurative phrase means in context, or why the author chose it over a literal alternative.",
        example:
          "'The city was a furnace in July.'\n→ Not literal: the city was extremely hot.\nWhy used? More vivid and emotionally intense than 'the city was very hot.'",
      },
      {
        title: "Cross-Text Connections",
        explanation:
          "Paired-passage questions ask you to compare two short texts on the same topic. Focus on: what both authors agree on, where they disagree, and how Author 2 would respond to a claim made by Author 1. Read each passage independently first, then synthesise.",
        example:
          "Text 1 argues social media harms teens.\nText 2 argues it depends on how it's used.\n→ They agree social media affects teens.\n→ They disagree on whether the effect is inherently negative.",
      },
    ],
  },

  "expression-ideas": {
    intro:
      "Expression of Ideas questions (about 20% of Reading & Writing) ask you to improve a piece of writing. Rather than correcting grammar, you're making rhetorical choices: selecting the best transition, deciding whether to add or cut information, reordering sentences for clarity, and tightening wordy phrasing.",
    concepts: [
      {
        title: "Transitions",
        explanation:
          "A transition's job is to signal the logical relationship between two ideas. Additive transitions (furthermore, additionally) build on a previous point. Contrastive transitions (however, nevertheless) introduce a reversal. Causal transitions (therefore, consequently) show cause and effect. Choosing the wrong type can completely reverse the intended meaning.",
        example:
          "'She studied for three hours. _____, she failed the exam.'\nLogical relationship: unexpected contrast.\n→ Correct: 'Nevertheless' or 'However'\n→ Wrong: 'Therefore' (implies studying caused the failure)",
      },
      {
        title: "Adding and Deleting Information",
        explanation:
          "When asked whether to add information, check if it directly supports the paragraph's main idea — not just if it's related to the topic. When asked whether to delete information, check if removing it weakens the argument or removes a necessary detail. 'Interesting but off-topic' is almost always a reason to delete.",
        example:
          "Paragraph about photosynthesis in rainforests.\nProposed addition: 'Rainforests are home to diverse animals.'\n→ Interesting? Yes. Relevant to photosynthesis? No.\n→ Should NOT be added.",
      },
      {
        title: "Logical Sequence",
        explanation:
          "Sentences should appear in the order that makes the argument clearest. A sentence that refers to 'this discovery' must follow the sentence describing the discovery. Look for pronouns and demonstratives ('this,' 'these,' 'it') as clues to what must come immediately before.",
        example:
          "Sentence A: 'This led researchers to revise the theory.'\nSentence B: 'In 2019, new data contradicted earlier findings.'\n→ B must come before A (the 'this' refers to the new data).",
      },
      {
        title: "Effective Introductions and Conclusions",
        explanation:
          "An effective introduction establishes the topic and often previews the argument. An effective conclusion reinforces the main point without introducing new claims. Wrong answer choices often go off-topic, add unrelated facts, or introduce a new argument in the final sentence.",
        example:
          "Bad conclusion: introduces a new claim ('Future research should explore…')\nGood conclusion: echoes the opening + restates why the argument matters, with no new ideas.",
      },
      {
        title: "Concision and Clarity",
        explanation:
          "Effective writing avoids redundancy, wordiness, and circular phrasing. If two answer choices communicate the same idea, the shorter one is almost always correct. Common redundancies to avoid: 'new innovation' (innovations are by definition new), 'the reason is because' (use 'the reason is that'), 'end result' (results are endings).",
        example:
          "Wordy: 'Due to the fact that it was raining outside, the game was cancelled.'\nConcise: 'Because it was raining, the game was cancelled.'\n(saves 6 words, same meaning)",
      },
    ],
  },

  "standard-english-conventions": {
    intro:
      "Standard English Conventions questions (about 26% of Reading & Writing) test grammar, punctuation, and sentence structure. You'll fix errors in subject-verb agreement, pronoun use, modifier placement, sentence boundaries, and punctuation. These questions have clear right and wrong answers based on grammar rules — there's no interpretation.",
    concepts: [
      {
        title: "Subject-Verb Agreement",
        explanation:
          "A verb must agree in number with its subject — not with the nearest noun. The most common trap is a prepositional phrase between the subject and verb that contains a different-number noun. Always identify the true subject first, then choose the matching verb form.",
        example:
          "'The list of requirements ___ posted on the board.'\nNearest noun: 'requirements' (plural)\nTrue subject: 'list' (singular)\n→ Correct: 'is posted'",
      },
      {
        title: "Pronoun Agreement and Case",
        explanation:
          "Pronouns must match their antecedent in number and gender. Indefinite pronouns (everyone, each, either, neither, someone) are singular and require singular verbs and pronouns. Also watch pronoun case: use 'who' for subjects, 'whom' for objects; 'I/he/she/we/they' as subjects; 'me/him/her/us/them' as objects.",
        example:
          "'Each of the students must submit ___ essay.'\nEach = singular → 'his or her essay'\n\n'Whom did you call?' (object of call)\n'Who called you?' (subject)",
      },
      {
        title: "Punctuation: Commas, Semicolons, and Colons",
        explanation:
          "Use a comma + coordinating conjunction (for, and, nor, but, or, yet, so) to join two independent clauses. A semicolon alone joins two independent clauses without a conjunction. A colon introduces a list, explanation, or elaboration. A comma splice — two independent clauses joined by only a comma — is always wrong on the SAT.",
        example:
          "Comma splice (wrong): 'I studied hard, I passed.'\nFixed with semicolon: 'I studied hard; I passed.'\nFixed with conjunction: 'I studied hard, and I passed.'\nColon use: 'I need three things: time, money, and focus.'",
      },
      {
        title: "Sentence Boundaries: Run-Ons and Fragments",
        explanation:
          "A complete sentence requires a subject and a finite verb. A fragment is missing one of these; a run-on fuses two independent clauses without correct punctuation. Fix run-ons with a period, semicolon, or comma + coordinating conjunction. Fix fragments by adding the missing element or attaching the fragment to an adjacent sentence.",
        example:
          "Fragment: 'Running along the beach at sunset.' (no finite verb)\n→ Fix: 'She was running along the beach at sunset.'\n\nRun-on: 'He left early he missed the announcement.'\n→ Fix: 'He left early; he missed the announcement.'",
      },
      {
        title: "Modifiers and Parallel Structure",
        explanation:
          "A modifier must be placed immediately next to what it modifies. A dangling modifier has no clear subject in the sentence. Parallel structure requires that items in a list or comparison use the same grammatical form (all nouns, all infinitives, all -ing phrases, etc.).",
        example:
          "Dangling: 'Running to catch the bus, the phone fell out of my pocket.'\n(The phone wasn't running!) → 'Running to catch the bus, I dropped my phone.'\n\nNon-parallel: 'She likes hiking, swimming, and to run.'\nParallel: 'She likes hiking, swimming, and running.'",
      },
    ],
  },
};

export function getLesson(slug: string): Lesson | null {
  return LESSONS[slug] ?? null;
}
