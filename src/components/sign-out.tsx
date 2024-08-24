import { signOut } from "@/auth";

export default function SignOut() {
  return (
    <form
      action={async () => {
        "use server";

        await signOut({
          redirectTo: "/",
        });
      }}
    >
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded-md"
      >
        Sign Out!
      </button>
    </form>
  );
}
