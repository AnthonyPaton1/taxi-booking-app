// app/api/test-approve/route.js
import { approveUser } from "@/app/actions/auth/approveUser";

export async function GET() {
  const testId = "cmfx20fz80003y5tectvppqix"; // Replace with an actual ID from your DB

  try {
    const result = await approveUser(testId);
    console.log("✅ ApproveUser called with:", testId);
    return Response.json({ message: "Success", result });
  } catch (error) {
    console.error("❌ Error approving user:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}