type PanelProps = {
  title: string;
  children: React.ReactNode;
};

export default function Panel({ title, children }: PanelProps) {
  return (
    <section className="shell-card">
      <header className="shell-divider px-4 py-3">
        <h2 className="font-semibold">{title}</h2>
      </header>

      <div className="p-4">{children}</div>
    </section>
  );
}
