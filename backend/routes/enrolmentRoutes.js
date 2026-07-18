const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/enrolmentController");

router.post(
  "/:courseId",
  auth,
  role("student"),
  asyncHandler(controller.enrol)
);

router.delete(
  "/:courseId",
  auth,
  role("student"),
  asyncHandler(controller.cancelEnrolment)
);

module.exports = router;
