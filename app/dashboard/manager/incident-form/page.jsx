'use client'
import NewIncidentForm from "@/components/forms/business/incidentForm";
import CheckoutSteps from "@/components/shared/header/managerSteps";

const NewIncidentReporting = () => {
    return ( 
        <>
        <CheckoutSteps current={5} />
        <NewIncidentForm />
        </>
     );
}
 
export default NewIncidentReporting;
