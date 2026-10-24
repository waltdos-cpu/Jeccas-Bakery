import { SettingsForm } from "@/components/admin/settings-form";
import { ShareCard } from "@/components/admin/share-card";
import { BAKERY_TZ, repo } from "@/lib/db";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await repo.getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return (
    <div>
      <h1 className="text-4xl">Settings</h1>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_18rem]">
        <SettingsForm settings={settings} timezone={BAKERY_TZ} />
        <ShareCard url={siteUrl} />
      </div>
    </div>
  );
}
