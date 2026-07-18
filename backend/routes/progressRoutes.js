const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  requireEnrolmentByCourseId,
  requireEnrolmentByLessonId
} = require("../middleware/accessMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/progressController");

router.post(
  "/lessons/:id/complete",
  auth,
  role("student"),
  requireEnrolmentByLessonId,
  asyncHandler(controller.completeLesson)
);

router.get(
  "/courses/:id/progress",
  auth,
  async (req, res, next) => {
    if (req.user.role === "student") {
      return requireEnrolmentByCourseId(req, res, next);
    }
    next();
  },
  asyncHandler(controller.getProgress)
);

router.get(
  "/lessons/:id",
  auth,
  requireEnrolmentByLessonId,
  asyncHandler(require("../controllers/courseController").getLesson)
);

module.exports = router;
