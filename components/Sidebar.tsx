"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";


const Sidebar = ({ user }: SiderbarProps) => {
  const pathname = usePathname();
  return (
    <section className="sidebar">
      <nav className="flex flex-row">
        <Link href="/" className=" cursor-pointer flex items-center gap-4">
          <Image
            src="/icons/logo.svg"
            alt="logo"
            width={34}
            height={34}
            className="size-[24px] max-xl:size-14"
          />

          <h1 className="sidebar-logo ">Horizon</h1>
        </Link>
      </nav>

      {sidebarLinks.map((item) => {
        const isActive =
          pathname === item.route || pathname.startsWith(`${item.route}/`);
        return (
          <Link
            href={item.route}
            key={item.label}
            className={cn("sidebar-link", { "bg-bank-gradient": isActive })}
          >
            <div className="relative size-6 ">
                <Image src={item.imgURL} alt={item.label} fill className={cn({'brightness-[3] invert-0' : isActive})}/>
            </div>
            <p className={cn('sidebar-label', {'!text-white' : isActive})}>
                {item.label}
            </p>
          </Link>
        );
      })}
    </section>
    );
};

export default Sidebar;
