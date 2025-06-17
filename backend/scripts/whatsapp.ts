import dotenv from "dotenv";
import {sendAdminWhatsApp} from "../src/lib/service";

dotenv.config();
sendAdminWhatsApp(3).catch((err) => {
  console.error(err);
  process.exit(1);
});
