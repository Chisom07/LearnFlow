const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/authController");

router.post("/register", asyncHandler(controller.register));
router.post("/login", asyncHandler(controller.login));
router.post("/logout", asyncHandler(controller.logout));
router.get("/me", auth, asyncHandler(controller.me));

module.exports = router;
