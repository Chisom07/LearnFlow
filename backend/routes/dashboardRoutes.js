const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/dashboardController");

router.get("/", auth, asyncHandler(controller.dashboard));

module.exports = router;
