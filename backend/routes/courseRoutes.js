const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  requireCourseOwnership
} = require("../middleware/accessMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/courseController");

router.post(
  "/",
  auth,
  role("instructor"),
  upload.single("thumbnail"),
  asyncHandler(controller.createCourse)
);

router.post(
  "/:id/lessons",
  auth,
  role("instructor"),
  requireCourseOwnership,
  upload.single("pdf_resource"),
  asyncHandler(controller.addLesson)
);

router.get("/", asyncHandler(controller.getCourses));
router.get("/:id", asyncHandler(controller.getCourse));

module.exports = router;
