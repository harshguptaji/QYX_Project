import { useState } from "react";

const TYPE_LABELS = {
  singleChoice: "Single choice",
  multipleChoice: "Multiple choice",
  text: "Text",
};

const QuizQuestionList = ({
  questions,
  isActive,
  disabled,
  onAdd,
  onEdit,
  onDelete,
  onMove,
}) => {
  const [deleteId, setDeleteId] = useState(null);

  const handleDelete = async (questionId) => {
    const deleted = await onDelete(questionId);

    if (deleted) {
      setDeleteId(null);
    }
  };

  return (
    <section className="aq-panel">
      <div className="aq-inline aq-spread">
        <div className="aq-panel-heading">
          <h2>Questions ({questions.length})</h2>
          <p>Manage content and change the display order.</p>
        </div>

        <button
          type="button"
          className="aq-button"
          disabled={disabled}
          onClick={onAdd}
        >
          Add question
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="aq-empty">
          <p>No questions added yet.</p>
          <p>Add your first question to start building the quiz.</p>
        </div>
      ) : (
        <div className="aq-question-list">
          {questions.map((question, index) => {
            const cannotDelete = isActive && questions.length === 1;

            return (
              <article className="aq-question-card" key={question._id}>
                <div className="aq-inline aq-spread">
                  <span className="aq-question-number">
                    Question {index + 1}
                  </span>

                  <div className="aq-badges">
                    <span className="aq-badge">
                      {TYPE_LABELS[question.questionType]}
                    </span>
                    {question.isRequired && (
                      <span className="aq-badge">Required</span>
                    )}
                    {question.isScored && (
                      <span className="aq-badge aq-badge-green">
                        Max {question.maxScore} points
                      </span>
                    )}
                  </div>
                </div>

                <h3>{question.questionText}</h3>

                {question.options.length > 0 && (
                  <ul className="aq-option-summary">
                    {question.options.map((option) => (
                      <li key={option._id}>
                        <span>{option.label}</span>
                        <small>
                          {option.tag.replaceAll("_", " ")}
                          {" · "}
                          {option.score} points
                        </small>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="aq-inline">
                  <button
                    type="button"
                    className="aq-button aq-button-secondary"
                    disabled={disabled}
                    onClick={() => onEdit(question)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="aq-button aq-button-secondary"
                    disabled={disabled || index === 0}
                    onClick={() => onMove(index, -1)}
                    aria-label={`Move question ${index + 1} up`}
                  >
                    Move up
                  </button>

                  <button
                    type="button"
                    className="aq-button aq-button-secondary"
                    disabled={disabled || index === questions.length - 1}
                    onClick={() => onMove(index, 1)}
                    aria-label={`Move question ${index + 1} down`}
                  >
                    Move down
                  </button>

                  <button
                    type="button"
                    className="aq-button aq-button-danger"
                    disabled={disabled || cannotDelete}
                    onClick={() => setDeleteId(question._id)}
                  >
                    Delete
                  </button>
                </div>

                {cannotDelete && (
                  <p className="aq-help">
                    Deactivate the quiz before deleting its last question.
                  </p>
                )}

                {deleteId === question._id && (
                  <div className="aq-delete-confirm">
                    <p>
                      Delete this question? Previous submissions retain their
                      saved answers.
                    </p>

                    <div className="aq-inline">
                      <button
                        type="button"
                        className="aq-button aq-button-danger"
                        disabled={disabled}
                        onClick={() => handleDelete(question._id)}
                      >
                        Confirm delete
                      </button>

                      <button
                        type="button"
                        className="aq-button aq-button-secondary"
                        disabled={disabled}
                        onClick={() => setDeleteId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default QuizQuestionList;