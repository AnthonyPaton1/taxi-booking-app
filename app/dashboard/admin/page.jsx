import CheckoutSteps from "@/components/shared/header/checkoutSteps";
import Onboarding from "./onboarding";

const AdminPage = () => {
  return (
    <>
      <CheckoutSteps current={0} />
      <Onboarding />
    </>
  );
};

export default AdminPage;
