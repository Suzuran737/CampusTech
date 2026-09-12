interface TabItem {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex gap-4 sm:gap-6" aria-label="Tabs" role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.key)}
              className={`min-h-11 border-b-2 px-1 pb-3 text-sm font-medium transition ${
                isActive
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
