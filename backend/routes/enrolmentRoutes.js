const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const controller = require("../controllers/enrolmentController");

router.post(
  "/:courseId",
  auth,
  role("student"),
  controller.enrol
);

module.exports = router;