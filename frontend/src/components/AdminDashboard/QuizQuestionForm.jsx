import { useState } from "react";

const newOption = () => ({
  label: "",
  tag: "neutral",
  score: 0,
});

const QuizQuestionForm = ({
  question,
  disabled,
  onSave,
  onCancel,
}) => {
  const [form, setForm] = useState(() => ({
    questionText: question?.questionText ?? "",
    questionType: question?.questionType ?? "singleChoice",
    isRequired: question?.isRequired ?? true,
    isScored: question?.isScored ?? false,
    maxScore: question?.maxScore ?? 0,
    options: question?.options?.length
      ? question.options.map((option) => ({
          _id: option._id,
          label: option.label,
          tag: option.tag,
          score: option.score,
        }))
      : [newOption(), newOption()],
  }));

  const [formError, setFormError] = useState("");

  const isText = form.questionType === "text";

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const changeType = (event) => {
    const questionType = event.target.value;

    setForm((current) => ({
      ...current,
      questionType,
      ...(questionType === "text"
        ? { isScored: false, maxScore: 0 }
        : {}),
    }));
  };

  const changeScoring = (event) => {
    const isScored = event.target.checked;

    setForm((current) => ({
      ...current,
      isScored,
      ...(!isScored
        ? {
            maxScore: 0,
            options: current.options.map((option) => ({
              ...option,
              score: 0,
            })),
          }
        : {}),
    }));
  };

  const updateOption = (index, field, value) => {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index
          ? { ...option, [field]: value }
          : option
      ),
    }));
  };

  const removeOption = (index) => {
    setForm((current) => ({
      ...current,
      options: current.options.filter((_, optionIndex) => optionIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const isScored = !isText && form.isScored;

    const options = isText
      ? []
      : form.options.map((option) => ({
          ...(option._id ? { _id: option._id } : {}),
          label: option.label.trim(),
          tag: option.tag,
          score: isScored ? Number(option.score) : 0,
        }));

    if (!isText && options.length < 2) {
      setFormError("Add at least two options.");
      return;
    }

    const scores = options.map((option) => option.score);
    const highestScore = Math.max(0, ...scores);

    const maxScore = !isScored
      ? 0
      : form.questionType === "singleChoice"
        ? highestScore
        : Number(form.maxScore);

    if (isScored && maxScore <= 0) {
      setFormError("A scored question needs a positive maximum score.");
      return;
    }

    if (isScored && form.questionType === "multipleChoice") {
      const availableScore = scores.reduce((sum, score) => sum + score, 0);

      if (maxScore < highestScore || maxScore > availableScore) {
        setFormError(
          `The score cap must be between ${highestScore} and ${availableScore}.`
        );
        return;
      }
    }

    const saved = await onSave({
      questionText: form.questionText.trim(),
      questionType: form.questionType,
      isRequired: form.isRequired,
      isScored,
      maxScore,
      options,
    });

    if (saved) {
      onCancel();
    }
  };

  return (
    <form className="aq-panel" onSubmit={handleSubmit}>
      <div className="aq-panel-heading">
        <h2>{question ? "Edit question" : "Add question"}</h2>
        <p>Configure the answer format, options and business-interest scores.</p>
      </div>

      <fieldset className="aq-fieldset" disabled={disabled}>
        <label className="aq-field">
          <span>Question</span>
          <textarea
            name="questionText"
            value={form.questionText}
            onChange={updateField}
            rows={3}
            required
            maxLength={2000}
          />
        </label>

        <label className="aq-field">
          <span>Answer format</span>
          <select value={form.questionType} onChange={changeType}>
            <option value="singleChoice">Single choice</option>
            <option value="multipleChoice">Multiple choice</option>
            <option value="text">Text answer</option>
          </select>
        </label>

        <div className="aq-inline">
          <label className="aq-check">
            <input
              name="isRequired"
              type="checkbox"
              checked={form.isRequired}
              onChange={updateField}
            />
            <span>Required question</span>
          </label>

          {!isText && (
            <label className="aq-check">
              <input
                type="checkbox"
                checked={form.isScored}
                onChange={changeScoring}
              />
              <span>Include in lead scoring</span>
            </label>
          )}
        </div>

        {!isText && (
          <div className="aq-options">
            <div className="aq-inline aq-spread">
              <h3>Answer options</h3>

              <button
                type="button"
                className="aq-button aq-button-secondary"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    options: [...current.options, newOption()],
                  }))
                }
              >
                Add option
              </button>
            </div>

            {form.options.map((option, index) => (
              <div className="aq-option" key={option._id ?? `new-${index}`}>
                <label className="aq-field">
                  <span>Option {index + 1}</span>
                  <input
                    value={option.label}
                    onChange={(event) =>
                      updateOption(index, "label", event.target.value)
                    }
                    required
                    maxLength={500}
                  />
                </label>

                <label className="aq-field">
                  <span>Tag</span>
                  <select
                    value={option.tag}
                    onChange={(event) =>
                      updateOption(index, "tag", event.target.value)
                    }
                  >
                    <option value="neutral">Neutral</option>
                    <option value="high_interest">High interest</option>
                    <option value="medium_interest">Medium interest</option>
                    <option value="low_interest">Low interest</option>
                  </select>
                </label>

                <label className="aq-field">
                  <span>Score</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    disabled={!form.isScored}
                    value={form.isScored ? option.score : 0}
                    onChange={(event) =>
                      updateOption(index, "score", event.target.value)
                    }
                  />
                </label>

                <button
                  type="button"
                  className="aq-button aq-button-danger"
                  disabled={form.options.length <= 2}
                  onClick={() => removeOption(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {!isText && form.isScored && (
          form.questionType === "multipleChoice" ? (
            <label className="aq-field">
              <span>Maximum score cap</span>
              <input
                name="maxScore"
                type="number"
                min="0"
                step="any"
                required
                value={form.maxScore}
                onChange={updateField}
              />
              <small>
                Selected scores are added together and capped at this value.
              </small>
            </label>
          ) : (
            <p className="aq-help">
              Maximum score is automatically set to the highest option score.
            </p>
          )
        )}

        {isText && (
          <p className="aq-help">
            Text questions collect information and do not contribute to scoring.
          </p>
        )}

        {formError && <p role="alert">{formError}</p>}

        <div className="aq-inline">
          <button type="submit" className="aq-button">
            {disabled ? "Please wait..." : question ? "Save question" : "Add question"}
          </button>

          <button
            type="button"
            className="aq-button aq-button-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </fieldset>
    </form>
  );
};

export default QuizQuestionForm;