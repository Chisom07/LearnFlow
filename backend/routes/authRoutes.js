const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/authController");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.get("/me", auth, controller.me);

module.exports = router;