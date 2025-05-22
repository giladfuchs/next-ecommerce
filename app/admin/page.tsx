import { redirect } from "next/navigation";
import { ModelType } from "../../lib/types";

export default function AdminRedirectPage() {
  redirect(`/admin/${ModelType.order}`);
}
