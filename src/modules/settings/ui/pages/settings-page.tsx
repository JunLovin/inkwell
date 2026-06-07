"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldAlert, TriangleAlert, User } from "lucide-react";
import gsap from "gsap";

import {
  SettingsTabs,
  type SettingsTabId,
} from "../components/settings-tabs";
import { ProfileSection } from "../components/profile-section";
import { AccountSection } from "../components/account-section";
import { DangerZoneSection } from "../components/danger-zone-section";

const tabs = [
  { id: "profile" as const, label: "Profile", icon: <User size={13} /> },
  { id: "account" as const, label: "Account", icon: <ShieldAlert size={13} /> },
  {
    id: "danger" as const,
    label: "Danger Zone",
    icon: <TriangleAlert size={13} />,
  },
];

export function SettingsPage() {
  const [active, setActive] = useState<SettingsTabId>("profile");
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 12, filter: "blur(4px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.35,
        ease: "power3.out",
      },
    );
  }, [active]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full px-6 py-6 gap-6 max-w-3xl mx-auto w-full"
    >
      <div>
        <h1 className="text-white text-2xl font-light tracking-tight">
          Settings
        </h1>
        <p className="text-zinc-600 text-xs mt-0.5">
          Manage your profile, security, and data.
        </p>
      </div>

      <SettingsTabs tabs={tabs} active={active} onChange={setActive} />

      <div ref={sectionRef} key={active}>
        {active === "profile" && <ProfileSection />}
        {active === "account" && <AccountSection />}
        {active === "danger" && <DangerZoneSection />}
      </div>
    </div>
  );
}
