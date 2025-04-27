import WasteListingForm from "@/components/app/WasteListingForm";

export default function CreateWasteListing() {
  return (
    <main className="pl-[24vw] py-14 pt-[15vh] px-12">
      <h1 className="py-4 text-center text-3xl font-bold">
        Waste Listing Form
      </h1>
      <p className="text-center text-gray-500 text-xs pb-8 px-16 border-b border-gray-500">
        Thank you for choosing our platform to connect with top-tier waste
        management service providers. To ensure you receive the best possible
        service, we ask that you complete the following waste listing form with
        as much detail as possible. This form is designed to gather all the
        essential information about the waste you need to manage, including its
        type, quantity, and any special considerations. By providing accurate
        and comprehensive details, you enable our service providers to offer
        tailored solutions that perfectly match your needs.
      </p>
      <WasteListingForm />
    </main>
  );
}
