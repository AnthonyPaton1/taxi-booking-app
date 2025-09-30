"use client"
import CheckoutSteps from "@/components/shared/header/SuperAdminCheckoutSteps";

const ManageBusinesses = () => {
    return ( 

        <>
        <CheckoutSteps current={2} />
        <h3>Manage, edit and remove all business accounts here</h3>
        </>
     );
}
 
export default ManageBusinesses;