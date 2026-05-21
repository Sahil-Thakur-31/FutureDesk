const sections = [
  { id: "dashboard", label: "Dashboard" },
  { id: "exams", label: "Exams" },
  { id: "applications", label: "Applications" },
  { id: "certificates", label: "Certificates" },
  { id: "idVault", label: "ID Vault" },
  { id: "tasks", label: "Tasks" }
] as const;

type SidebarProps = {
  activeSection: string;
  onSelect: (section: any) => void;
};

export function Sidebar({ activeSection, onSelect }: SidebarProps) {
  return (
    <aside className="flex w-64 flex-col rounded-[22px] bg-ink px-4 py-4 text-white shadow-card">
      <div className="mb-5">
        <div className="font-display text-xl font-semibold">FutureDesk</div>
      </div>

      <nav className="space-y-1.5">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
              activeSection === section.id ? "bg-white text-ink" : "bg-white/5 text-white/80 hover:bg-white/10"
            }`}
            onClick={() => onSelect(section.id)}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
