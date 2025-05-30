import React from "react";
import TeamProfileForm from "@/components/app/TeamDashboard/TeamProfileForm";

export default function TeamProfile() {
  return (
    <div className="p-96">
      <h1>This is the settings page</h1>
      This page is where admin creates a new team
      <TeamProfileForm />
    </div>
  );
}
