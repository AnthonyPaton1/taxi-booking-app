// app/test/page.jsx
import { approveUser } from "@/app/actions/auth/approveUser";

export default async function TestPage() {
  // Replace with the actual ID from RegisterInterest
  const id = "cmfz9gv9q0000y5uuvg5l4pbh";

  try {
    const user = await approveUser(id);
    console.log("✅ Approved user:", user.email);
  } catch (err) {
    console.error("❌ Error approving user:", err);
  }

  return (
    <div>
      <h1>Check your console</h1>
      <p>This page triggered approveUser().</p>
    </div>
  );
}
