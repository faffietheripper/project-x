import Link from "next/link";
import { getProfileByUserId } from "@/data-access/profiles"; // or server-actions if you've combined
import { auth } from "@/auth"; // your own auth helper from next-auth
import SignOutButton from "./SignOutButton"; // 👈 client component

export default async function Header2() {
  const session = await auth();

  let fullName = "Guest";
  if (session?.user?.id) {
    const profile = await getProfileByUserId(session.user.id);
    fullName = profile?.fullName ?? "Unknown User";
  }

  return (
    <div className="bg-black fixed text-white pb-8 pr-8 grid place-content-end place-items-center z-10 w-full h-[13vh]">
      <div className="space-x-5 flex">
        <Link href="/home/me" className="flex items-center space-x-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-10"
          >
            <path
              fillRule="evenodd"
              d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
              clipRule="evenodd"
            />
          </svg>
          <div>{fullName}</div>
        </Link>

        <SignOutButton />
      </div>
    </div>
  );
}
