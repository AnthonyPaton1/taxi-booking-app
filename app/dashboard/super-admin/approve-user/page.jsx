// app/superadmin/page.jsx
import { approveUser } from "@/app/actions/auth/approveUser";
import { prisma } from "@/lib/db";
import CheckoutSteps from "@/components/shared/header/SuperAdminCheckoutSteps";

export default async function SuperAdminPage() {
  const registrations = await prisma.registerInterest.findMany({
    where: {
      approved: false, // optional: only show pending approvals
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
   <CheckoutSteps current={3} />
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">🚦 Pending Approvals</h1>

      {registrations.length === 0 ? (
        <p>No pending users to approve.</p>
      ) : (
        <ul className="space-y-4">
          {registrations.map((reg) => (
            <li key={reg.id} className="border p-4 rounded shadow-sm">
              <p><strong>Name:</strong> {reg.name}</p>
              <p><strong>Email:</strong> {reg.email}</p>
              <p><strong>Type:</strong> {reg.type}</p>

              <form action={approveUser}>
                <input type="hidden" name="registrationId" value={reg.id} />
                <button
                  type="submit"
                  className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                >
                  Approve
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
     </>
  );
}
