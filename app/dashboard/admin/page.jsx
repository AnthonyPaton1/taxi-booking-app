import Onboarding from "./onboarding";
import CheckoutSteps from "@/components/shared/header/checkoutSteps";
const AdminPage = () => {
  return (
    <>
      <CheckoutSteps current={0} />
      <Onboarding />
    </>
  );
};

export default AdminPage;
