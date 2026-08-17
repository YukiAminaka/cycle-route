import { SettingsSidebar } from "./settingsSideber";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full overflow-hidden">
      <SettingsSidebar />
      <div className="flex flex-col flex-1 overflow-y-auto">
        <main className="flex-1 p-8">{children}</main>
        <footer className="border-t py-4">
          <div className="container px-4 text-center text-sm text-muted-foreground lg:px-6">
            © 2025 CycleRoute. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
