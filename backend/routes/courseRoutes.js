const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const controller = require("../controllers/courseController");

router.post(
  "/",
  auth,
  role("instructor"),
  upload.single("thumbnail"),
  controller.createCourse
);

router.post(
  "/:id/lessons",
  auth,
  role("instructor"),
  upload.single("pdf_resource"),
  controller.addLesson
);

router.get("/", controller.getCourses);
router.get("/:id", controller.getCourse);

module.exports = router;