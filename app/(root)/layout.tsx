import MobileNavBar from "@/components/MobileNavBar";
import Sidebar from "@/components/Sidebar";
import { log } from "console";
import Image from "next/image";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loggedIn = { firstName: "Sarth", lastName: "Dhakade" };
  return (
    <main className="flex h-screen w-full font-inter">
      <Sidebar user={loggedIn} />

      <div className="flex size-full flex-col ">
        <div className="root-layout">
          <Image src="/icons/logo.svg" width={30} height={30} alt="logo" className="cursor-pointer"/>

          <div>
            <MobileNavBar user={loggedIn} />
          </div>
        </div>

        {children}
      </div>
    </main>
  );
}
