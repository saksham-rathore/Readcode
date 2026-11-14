export interface QuestionCardItem {
  icon: string;
  question: string;
  type: string;
}

export const defaultQuestions: QuestionCardItem[] = [
  {
    icon: "↗",
    question: "“Explain the authentication flow.”",
    type: "FOLLOW THE LOGIC",
  },
  {
    icon: "⌘",
    question: "“What depends on this service?”",
    type: "MAP THE CONNECTIONS",
  },
  {
    icon: "⌁",
    question: "“How does our data model fit together?”",
    type: "SEE THE BIG PICTURE",
  },
];

export interface QuestionsSectionProps {
  kicker?: string;
  questions?: QuestionCardItem[];
}

export function QuestionsSection({
  kicker = "ASK THE QUESTIONS THAT MOVE YOU FORWARD",
  questions = defaultQuestions,
}: QuestionsSectionProps) {
  return (
    <section className="question-section" id="how-it-works">
      <div className="section-wrap question-inner">
        <div className="section-kicker">{kicker}</div>
        <h2>
          From “where is it?”
          <br />
          to <span>“now I get it.”</span>
        </h2>
        <div className="question-grid">
          {questions.map((card) => (
            <div className="question-card" key={card.question}>
              <span className="q-icon">{card.icon}</span>
              <p>{card.question}</p>
              <span className="q-type">{card.type}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default QuestionsSection;
