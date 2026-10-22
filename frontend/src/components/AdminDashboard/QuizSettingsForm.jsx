import { useState } from "react";

const QuizSettingsForm = ({ quiz, disabled, onSave }) => {
  const [form, setForm] = useState({
    title: quiz?.title ?? "",
    description: quiz?.description ?? "",
    isActive: quiz?.isActive ?? false,
    veryGoodMinPercentage:
      quiz?.scoringRules?.veryGoodMinPercentage ?? 75,
    goodMinPercentage:
      quiz?.scoringRules?.goodMinPercentage ?? 40,
  });

  const [formError, setFormError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const good = Number(form.goodMinPercentage);
    const veryGood = Number(form.veryGoodMinPercentage);

    if (good >= veryGood) {
      setFormError(
        "The Good threshold must be lower than the Very Good threshold."
      );
      return;
    }

    if (form.isActive && !quiz?.questions?.length) {
      setFormError("Add at least one question before publishing.");
      return;
    }

    await onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      isActive: form.isActive,
      scoringRules: {
        goodMinPercentage: good,
        veryGoodMinPercentage: veryGood,
      },
    });
  };

  return (
    <form className="aq-panel" onSubmit={handleSubmit}>
      <div className="aq-panel-heading">
        <h2>{quiz ? "Quiz settings" : "Create your quiz"}</h2>
        <p>Manage the introduction, availability and lead thresholds.</p>
      </div>

      <fieldset className="aq-fieldset" disabled={disabled}>
        <label className="aq-field">
          <span>Quiz title</span>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="QYX Consultation Quiz"
            required
            maxLength={200}
          />
        </label>

        <label className="aq-field">
          <span>Description</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            maxLength={2000}
          />
        </label>

        <div className="aq-form-grid">
          <label className="aq-field">
            <span>Good starts at (%)</span>
            <input
              name="goodMinPercentage"
              type="number"
              min="0"
              max="100"
              step="any"
              required
              value={form.goodMinPercentage}
              onChange={handleChange}
            />
          </label>

          <label className="aq-field">
            <span>Very Good starts at (%)</span>
            <input
              name="veryGoodMinPercentage"
              type="number"
              min="0"
              max="100"
              step="any"
              required
              value={form.veryGoodMinPercentage}
              onChange={handleChange}
            />
          </label>
        </div>

        <label className="aq-check">
          <input
            name="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={handleChange}
          />
          <span>Publish quiz for visitors</span>
        </label>

        {!quiz && (
          <p className="aq-help">
            Create a draft first, add questions, then publish it.
          </p>
        )}

        {formError && <p role="alert">{formError}</p>}

        <button className="aq-button" type="submit">
          {disabled ? "Please wait..." : quiz ? "Save settings" : "Create draft"}
        </button>
      </fieldset>
    </form>
  );
};

export default QuizSettingsForm;