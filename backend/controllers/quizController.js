import Quiz from "../models/Quiz.js";

const normalizeAnswer = (value) =>
  String(value ?? "")
    .trim()
    .replace(/^[A-Da-d][).:-]\s*/, "")
    .replace(/^0?[1-4][).:-]\s*/, "")
    .replace(/\s+/g, " ")
    .toLowerCase();

const getAnswerIndex = (answer, options) => {
  const rawAnswer = String(answer ?? "").trim();

  const numericMatch = rawAnswer.match(/^0?([1-4])(?:[).:-]|\s|$)/);
  if (numericMatch) {
    return Number(numericMatch[1]) - 1;
  }

  const letterMatch = rawAnswer.match(/^([A-Da-d])(?:[).:-]|\s|$)/);
  if (letterMatch) {
    return letterMatch[1].toUpperCase().charCodeAt(0) - 65;
  }

  const normalizedAnswer = normalizeAnswer(rawAnswer);
  return options.findIndex((option) => normalizeAnswer(option) === normalizedAnswer);
};

const answersMatch = (selectedAnswer, correctAnswer, options) => {
  const selectedIndex = getAnswerIndex(selectedAnswer, options);
  const correctIndex = getAnswerIndex(correctAnswer, options);

  if (selectedIndex !== -1 && correctIndex !== -1) {
    return selectedIndex === correctIndex;
  }

  return normalizeAnswer(selectedAnswer) === normalizeAnswer(correctAnswer);
};

// @desc    Get all quizzes for a document
// @route   GET /api/quizzes/:documentId
// @access  Private
export const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({
      userId: req.user._id,
      documentId: req.params.documentId,
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single quiz by ID
// @route   GET /api/quizzes/quiz/:id
// @access  Private
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz answers
// @route   POST /api/quizzes/:id/submit
// @access  Private
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: "Please provide answers array",
        statusCode: 400,
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    if (quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz already completed",
        statusCode: 400,
      });
    }

    // Process answers
    let correctCount = 0;
    const userAnswers = [];

    answers.forEach((answer) => {
      const { questionIndex, selectedAnswer } = answer;

      if (questionIndex < quiz.questions.length) {
        const question = quiz.questions[questionIndex];
        const selectedIndex = getAnswerIndex(selectedAnswer, question.options);
        const canonicalSelectedAnswer =
          selectedIndex >= 0 ? question.options[selectedIndex] : selectedAnswer;
        const isCorrect = answersMatch(
          canonicalSelectedAnswer,
          question.correctAnswer,
          question.options,
        );

        if (isCorrect) correctCount++;

        userAnswers.push({
          questionIndex,
          selectedAnswer: canonicalSelectedAnswer,
          isCorrect,
          answeredAt: new Date(),
        });
      }
    });

    // Calculate score
    const score = Math.round((correctCount / quiz.totalQuestions) * 100);

    // Update quiz
    quiz.userAnswers = userAnswers;
    quiz.score = score;
    quiz.completedAt = new Date();

    await quiz.save();

    res.status(200).json({
      success: true,
      data: {
        quizId: quiz._id,
        score,
        correctCount,
        totalQuestions: quiz.totalQuestions,
        percentage: score,
        userAnswers,
      },
      message: "Quiz submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quiz results
// @route   GET /api/quizzes/:id/results
// @access  Private
export const getQuizResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("documentId", "title");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    if (!quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz not completed yet",
        statusCode: 400,
      });
    }

    // Build detailed results
    const detailedResults = quiz.questions.map((question, index) => {
      const userAnswer = quiz.userAnswers.find(
        (a) => a.questionIndex === index,
      );
      const selectedAnswer = userAnswer?.selectedAnswer || null;
      const isCorrect = answersMatch(
        selectedAnswer,
        question.correctAnswer,
        question.options,
      );

      return {
        questionIndex: index,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        selectedAnswer,
        isCorrect,
        explanation: question.explanation,
      };
    });
    const correctCount = detailedResults.filter((result) => result.isCorrect).length;
    const score = Math.round((correctCount / quiz.totalQuestions) * 100);

    res.status(200).json({
      success: true,
      data: {
        quiz: {
          id: quiz._id,
          title: quiz.title,
          document: quiz.documentId,
          score,
          totalQuestions: quiz.totalQuestions,
          completedAt: quiz.completedAt,
        },
        results: detailedResults,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
