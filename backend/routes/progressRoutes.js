const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const controller = require("../controllers/progressController");

router.post(
  "/lessons/:id/complete",
  auth,
  controller.completeLesson
);

router.get(
  "/courses/:id/progress",
  auth,
  controller.getProgress
);

module.exports = router;