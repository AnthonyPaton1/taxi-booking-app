import { getSessionUser } from "@/lib/getSessionUser";
import { getDriverProfile } from "@/app/actions/driver/getDriverProfile";
import DriverEditForm from "@/components/forms/driver/DriverEditForm";
import CheckoutSteps from "@/components/shared/header/driverSteps";

export default async function EditDriverPage() {
  const user = await getSessionUser();
  const driver = await getDriverProfile();

  return (
    <>
      <CheckoutSteps current={7} />
      <div className="p-6 space-y-6">
        
        
        <DriverEditForm formData={driver} />
      </div>
    </>
  );
}