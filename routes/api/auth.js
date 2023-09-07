import  express  from "express"; 
import { validateUser, schemas } from "../../helpers/validateUser.js";
import { auth } from "../../controllers/index.js";
import { authenticate, upload } from "../../middlewares/index.js";

const router = new express.Router();

router.post('/register', validateUser(schemas.registerSchema), auth.createUser);
router.get('/verify/:verificationToken', auth.verifyEmail);
router.post('/verify', validateUser(schemas.emailSchema),auth.resentVerifyEmail);
router.post('/login', validateUser(schemas.loginSchema), auth.login);
router.post('/logout', authenticate, auth.logout);
router.get('/current', authenticate, auth.getCurrent);
router.patch('/avatars', authenticate, upload.single("avatar"), auth.updAvatars);

export default router;