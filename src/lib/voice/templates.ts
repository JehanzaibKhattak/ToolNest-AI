export type ReceptionistTemplate = {
  id: string;
  label: string;
  industry: string;
  services: string;
  businessHours: string;
  faqs: string;
  bookingInstructions: string;
};
export const RECEPTIONIST_TEMPLATES: ReceptionistTemplate[] = [
  {
    id: "dental",
    label: "Dental clinic",
    industry: "dental clinic",
    services:
      "Check-ups and cleanings, fillings, whitening, crowns, emergency dental visits. New patient exam from $89.",
    businessHours:
      "Monday to Friday 8am to 6pm, Saturday 9am to 1pm, closed Sunday.",
    faqs: "We accept most major dental insurance plans. Free parking is available behind the building. Please arrive 10 minutes early for your first visit.",
    bookingInstructions:
      "Ask whether they are a new or existing patient and whether they are in pain. Treat severe pain or swelling as urgent.",
  },
  {
    id: "home-services",
    label: "Plumbing / HVAC",
    industry: "home services",
    services:
      "Emergency plumbing, drain cleaning, water heater repair and installation, AC and furnace repair, maintenance plans. Call-out fee $79, waived if work goes ahead.",
    businessHours:
      "Office Monday to Saturday 7am to 7pm. Emergency service 24/7.",
    faqs: "We serve the greater metro area. All technicians are licensed and insured. We offer financing on installations.",
    bookingInstructions:
      "Collect the service address and a description of the problem. Treat active leaks, no heat in winter and gas smells as high urgency.",
  },
  {
    id: "salon",
    label: "Hair & beauty salon",
    industry: "hair and beauty salon",
    services:
      "Haircuts from $35, colour from $90, blow-dry $40, manicures $30, facials $75.",
    businessHours:
      "Tuesday to Saturday 9am to 7pm, Thursday until 9pm. Closed Sunday and Monday.",
    faqs: "Cancellations need 24 hours notice. Gift cards are available in store.",
    bookingInstructions: "Ask for a preferred stylist if they have one.",
  },
  {
    id: "law",
    label: "Law firm",
    industry: "law firm",
    services:
      "Personal injury, family law and estate planning. Free 15-minute initial consultation.",
    businessHours: "Monday to Friday 9am to 5pm.",
    faqs: "We cannot give legal advice over the phone before a consultation. Consultations can be in person or by video.",
    bookingInstructions:
      "Ask for the type of matter and any upcoming court dates. Do not collect detailed case facts.",
  },
];
