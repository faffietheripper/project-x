"use client";

import React from "react";

interface CompanyProfileProps {
  profile: {
    companyName: string;
    companyOverview: string;
    telephone: string;
    emailAddress: string;
    country: string;
    streetAddress: string;
    city: string;
    region: string;
    postCode: string;
    wasteManagementMethod: string;
    wasteManagementNeeds: string;
  };
}

export default function CompanyProfile({ profile }: CompanyProfileProps) {
  if (!profile) {
    return <p>Profile data is missing</p>;
  }

  return (
    <div className="profile-container">
      <h1>{profile.companyName}</h1>
      <p>{profile.companyOverview}</p>
      <p>
        <strong>Telephone:</strong> {profile.telephone}
      </p>
      <p>
        <strong>Email:</strong> {profile.emailAddress}
      </p>
      <p>
        <strong>Country:</strong> {profile.country}
      </p>
      <p>
        <strong>Address:</strong> {profile.streetAddress}, {profile.city},{" "}
        {profile.region}, {profile.postCode}
      </p>
      <p>
        <strong>Waste Management Method:</strong>{" "}
        {profile.wasteManagementMethod}
      </p>
      <p>
        <strong>Waste Management Needs:</strong> {profile.wasteManagementNeeds}
      </p>
    </div>
  );
}
