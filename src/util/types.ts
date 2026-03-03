export type ProfileData = {
  profilePicture?: string;
  companyName?: string;
  companyOverview?: string;
  telephone?: string;
  emailAddress?: string;
  country?: string;
  streetAddress?: string;
  city?: string;
  region?: string;
  postCode?: string;
  wasteManagementMethod?: string;
  wasteManagementNeeds?: string;
  wasteType?: string;
  environmentalPolicy?: string;
  certifications?: string;
};

export type AppUser = {
  id: string;
  organisationId: string | null;
  role: "administrator" | "employee" | "seniorManagement" | "platform_admin";
};
