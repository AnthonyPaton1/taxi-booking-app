import InfoBox from "@/components/layout/InfoBox";
import { signIn } from "next-auth/react";

const InfoBoxes = () => {
  return (
    <section aria-labelledby="neat-section" role="region">
      <h2 id="neat-section" className="sr-only">
        NEAT Transport Access Options
      </h2>
      <div className="container-xl lg:container m-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
          <InfoBox
            heading="NEAT for Individuals"
            backgroundColor="bg-blue-100"
            buttonInfo={{
              text: "Request a Journey",
              onClick: () =>
                signIn("google", {
                  callbackUrl: "/auth/public-redirect",
                  prompt: "select_account",
                }),

              backgroundColor: "bg-blue-700",
              ariaLabel: "Request accessible transport",
            }}
          >
            Book transport for yourself or a family member.
          </InfoBox>

         <InfoBox
  heading="NEAT for Businesses and Drivers"
  backgroundColor="bg-blue-100"
  buttonInfo={{
    text: "Sign in Here",
    
     onClick: () => (window.location.href = "/login"),
    backgroundColor: "bg-blue-700",
    ariaLabel: "Sign in as business user",
  }}
>
  Sign in to access bookings, manage trips, and view bids.
</InfoBox>
        </div>
      </div>
    </section>
  );
};

export default InfoBoxes;
