import CheckoutSteps from "@/components/shared/header/managerSteps";
import JourneyBookingForm from "@/components/forms/journeyBookingForm";
const createBookingsPage = () => {
  return (
    <>
    <CheckoutSteps current={1} />
    <div> Business Ride request form</div>
    <JourneyBookingForm />
    </>
  )
};

export default createBookingsPage;
