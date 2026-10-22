import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  fetchAdminQuiz,
  createAdminQuiz,
  updateAdminQuiz,
  addQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  reorderQuizQuestions,
  clearAdminQuizMessages,
} from "../../features/admin/quiz/adminQuizSlice.js";

import QuizSettingsForm from "../../components/AdminDashboard/QuizSettingsForm.jsx";
import QuizQuestionForm from "../../components/AdminDashboard/QuizQuestionForm.jsx";
import QuizQuestionList from "../../components/AdminDashboard/QuizQuestionList.jsx";

import "./AdminQuiz.css";

const AdminQuizPage = () => {
  const dispatch = useDispatch();

  const {
    quiz,
    loading,
    saving,
    notFound,
    needsRefresh,
    error,
    validationErrors,
    successMessage,
  } = useSelector((state) => state.adminQuiz);

  // null = editor closed.
  // { question: null } = adding a new question.
  // { question: {...} } = editing an existing question.
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminQuiz());
  }, [dispatch]);

  const disabled = loading || saving || needsRefresh;

  const questions = [...(quiz?.questions ?? [])].sort(
    (a, b) => a.order - b.order
  );

  const runAction = async (action) => {
    try {
      await dispatch(action).unwrap();
      return true;
    } catch {
      // API failures are displayed from Redux below.
      return false;
    }
  };

  const handleSettingsSave = (fields) =>
    runAction(
      quiz ? updateAdminQuiz(fields) : createAdminQuiz(fields)
    );

  const handleQuestionSave = (fields) => {
    if (editor?.question) {
      return runAction(
        updateQuizQuestion({
          questionId: editor.question._id,
          ...fields,
        })
      );
    }

    return runAction(addQuizQuestion(fields));
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= questions.length) {
      return;
    }

    const orderedIds = questions.map((question) => question._id);

    [orderedIds[index], orderedIds[targetIndex]] = [
      orderedIds[targetIndex],
      orderedIds[index],
    ];

    return runAction(
      reorderQuizQuestions({ questionIds: orderedIds })
    );
  };

  const reloadQuiz = () => {
    // Discard the open editor before loading the latest version.
    setEditor(null);
    dispatch(fetchAdminQuiz());
  };

  const openEditor = (question = null) => {
    dispatch(clearAdminQuizMessages());
    setEditor({ question });
  };

  return (
    <main className="aq-page">
      <div className="aq-container">
        <header className="aq-header">
          <div>
            <span className="aq-eyebrow">QYX ADMIN</span>
            <h1>Quiz management</h1>
            <p>Manage questions, answer options and lead scoring.</p>
          </div>

          <div className="aq-inline">
            <Link className="aq-button aq-button-secondary" to="/accios/quiz/responses">
              Responses
            </Link>

            <button
              type="button"
              className="aq-button aq-button-secondary"
              disabled={loading || saving}
              onClick={reloadQuiz}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        {successMessage && (
          <div className="aq-notice aq-notice-success" role="status">
            <span>{successMessage}</span>
            <button
              type="button"
              onClick={() => dispatch(clearAdminQuizMessages())}
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="aq-notice aq-notice-error" role="alert">
            <div>
              <p>{error}</p>

              {validationErrors.length > 0 && (
                <ul>
                  {validationErrors.map((message, index) => (
                    <li key={`${index}-${message}`}>{message}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {needsRefresh && (
          <div className="aq-notice aq-notice-warning" role="alert">
            <p>
              The quiz changed. Refresh before continuing. Unsaved form edits
              will be discarded.
            </p>

            <button
              type="button"
              className="aq-button"
              disabled={loading || saving}
              onClick={reloadQuiz}
            >
              Load latest quiz
            </button>
          </div>
        )}

        {loading && <p role="status">Loading quiz...</p>}

        {!loading && !quiz && !notFound && (
          <div className="aq-panel aq-empty">
            <p>Unable to load the quiz.</p>
            <button
              type="button"
              className="aq-button"
              onClick={reloadQuiz}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && (quiz || notFound) && (
          <>
            {quiz && (
              <div className="aq-stats">
                <div className="aq-stat">
                  <span>Status</span>
                  <strong>{quiz.isActive ? "Published" : "Draft"}</strong>
                </div>

                <div className="aq-stat">
                  <span>Questions</span>
                  <strong>{questions.length}</strong>
                </div>

                <div className="aq-stat">
                  <span>Scored questions</span>
                  <strong>
                    {questions.filter((question) => question.isScored).length}
                  </strong>
                </div>

                <div className="aq-stat">
                  <span>Version</span>
                  <strong>{quiz.version}</strong>
                </div>
              </div>
            )}

            {editor && quiz ? (
              <QuizQuestionForm
                key={editor.question?._id ?? "new-question"}
                question={editor.question}
                disabled={disabled}
                onSave={handleQuestionSave}
                onCancel={() => setEditor(null)}
              />
            ) : (
              <>
                <QuizSettingsForm
                  key={`${quiz?._id ?? "draft"}-${quiz?.version ?? 0}`}
                  quiz={quiz}
                  disabled={disabled}
                  onSave={handleSettingsSave}
                />

                {quiz && (
                  <QuizQuestionList
                    questions={questions}
                    isActive={quiz.isActive}
                    disabled={disabled}
                    onAdd={() => openEditor()}
                    onEdit={openEditor}
                    onDelete={(questionId) =>
                      runAction(deleteQuizQuestion({ questionId }))
                    }
                    onMove={handleMove}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default AdminQuizPage;