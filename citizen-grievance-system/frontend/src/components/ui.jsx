import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { api, clearSession, getCurrentUser } from "../lib/api";

export function Icon({ name, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "bg-secondary text-white hover:bg-secondary-dark",
    outline: "border border-border bg-white text-primary hover:bg-surface-soft",
    danger: "bg-danger text-white hover:bg-red-800",
    ghost: "text-primary hover:bg-surface-soft",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-slate-100 text-slate-700",
    blue: "bg-blue-100 text-blue-700",
    teal: "bg-teal-100 text-teal-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-700",
    purple: "bg-indigo-100 text-indigo-700",
  };
  return <span className={`status-badge ${tones[tone]}`}>{children}</span>;
}

export function Card({ children, className = "" }) {
  return <section className={`app-card ${className}`}>{children}</section>;
}

export function StatCard({ label, value, icon, tone = "primary", note }) {
  const toneClass = {
    primary: "text-primary",
    secondary: "text-secondary",
    amber: "text-warning",
    red: "text-danger",
    green: "text-success",
  }[tone];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</p>
          <p className={`mt-2 font-display text-3xl font-bold ${toneClass}`}>{value}</p>
          {note ? <p className="mt-1 text-xs text-text-muted">{note}</p> : null}
        </div>
        {icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-soft text-primary">
            <Icon name={icon} />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-primary">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-main outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export function Table({ columns, rows, renderActions }) {
  return (
    <div className="rounded-lg border border-border bg-white">
      <div className="grid divide-y divide-border md:hidden">
        {rows.map((row) => (
          <article key={row.id} className="p-4">
            <div className="grid gap-3">
              {columns.map((column) => (
                <div key={column.key} className="grid grid-cols-[112px_1fr] gap-3 text-sm">
                  <span className="text-xs font-bold uppercase text-text-muted">{column.label}</span>
                  <span className="min-w-0 break-words font-medium text-text-main">
                    {column.render ? column.render(row) : row[column.key]}
                  </span>
                </div>
              ))}
            </div>
            {renderActions ? <div className="mt-4 border-t border-border pt-3">{renderActions(row)}</div> : null}
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface-soft text-left text-xs font-bold uppercase tracking-wide text-text-muted">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3">
                {column.label}
              </th>
            ))}
            {renderActions ? <th className="px-4 py-3">Actions</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-surface-muted/60">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 align-top">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
              {renderActions ? <td className="px-4 py-3">{renderActions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export function EmptyMap({ label = "Map preview", children }) {
  return (
    <div className="relative min-h-64 overflow-hidden rounded-lg border border-border bg-[#dce8df]">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute left-8 top-8 h-32 w-72 rotate-12 rounded-full border-8 border-white/70" />
        <div className="absolute bottom-8 right-10 h-24 w-80 -rotate-12 rounded-full border-8 border-white/70" />
        <div className="absolute left-1/3 top-0 h-full w-4 rotate-12 bg-white/60" />
        <div className="absolute left-0 top-1/2 h-4 w-full -rotate-6 bg-white/60" />
      </div>
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-md bg-white px-4 py-3 text-center shadow-sm">
        <Icon name="location_on" className="text-danger" />
        <p className="text-sm font-semibold text-primary">{label}</p>
        {children}
      </div>
    </div>
  );
}

export function SidebarLayout({ title, subtitle, navItems, children, scope = "admin", loginPath = "/admin/login" }) {
  const navigate = useNavigate();
  const user = getCurrentUser(scope);
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.listNotifications().then((data) => setNotifications(data.results || [])).catch(() => setNotifications([]));
  }, []);

  function submitSearch(event) {
    event.preventDefault();
    if (search.trim()) {
      navigate(`/admin/complaints?search=${encodeURIComponent(search.trim())}`);
    }
  }

  function logout() {
    clearSession(scope);
    navigate(loginPath);
  }

  return (
    <div className="min-h-screen bg-surface-muted text-text-main">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col bg-primary px-3 py-6 text-white lg:flex">
        <div className="mb-8 px-3">
          <p className="font-display text-xl font-bold">{title}</p>
          <p className="text-sm text-white/70">{subtitle}</p>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? "bg-secondary text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon name={item.icon} className="text-[20px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-3 pt-5 text-sm text-white/80">
          <p className="font-semibold">Sahayak AI</p>
          <p className="text-xs text-white/55">Grievance Division</p>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white px-4 lg:px-8">
          <Link to="/" className="max-w-[190px] truncate font-display text-base font-bold text-primary sm:max-w-none sm:text-xl">
            Smart Grievance Routing System
          </Link>
          <div className="relative flex items-center gap-3">
            <form className="hidden md:block" onSubmit={submitSearch}>
              <input
                className="w-72 rounded-md border border-border bg-surface-soft px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search complaints, wards, text"
              />
            </form>
            <button
              className="relative rounded-full p-2 text-text-muted hover:bg-surface-soft"
              aria-label="Notifications"
              onClick={() => {
                setShowNotifications((value) => !value);
                setShowAccount(false);
              }}
            >
              <Icon name="notifications" />
              {notifications.length ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" /> : null}
            </button>
            <button
              className="rounded-full p-2 text-text-muted hover:bg-surface-soft"
              aria-label="Profile"
              onClick={() => {
                setShowAccount((value) => !value);
                setShowNotifications(false);
              }}
            >
              <Icon name="account_circle" />
            </button>
            {showNotifications ? (
              <div className="absolute right-12 top-12 z-50 w-80 rounded-lg border border-border bg-white p-3 shadow-lg">
                <p className="mb-2 font-semibold text-primary">Notifications</p>
                {notifications.length === 0 ? (
                  <p className="text-sm text-text-muted">No notifications yet.</p>
                ) : (
                  <div className="max-h-80 space-y-2 overflow-auto">
                    {notifications.slice(0, 6).map((item) => (
                      <div key={item.id} className="rounded-md bg-surface-soft p-3">
                        <p className="text-sm font-semibold text-primary">{item.title}</p>
                        <p className="text-xs text-text-muted">{item.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
            {showAccount ? (
              <div className="absolute right-0 top-12 z-50 w-64 rounded-lg border border-border bg-white p-3 shadow-lg">
                <p className="font-semibold text-primary">{user?.name || "Account"}</p>
                <p className="text-sm text-text-muted">+91 {user?.mobile_number || "-"}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-secondary">{user?.role || "user"}</p>
                <button
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                  onClick={logout}
                >
                  <Icon name="logout" className="text-[18px]" />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] p-4 pb-24 lg:p-8">{children}</main>
        <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t border-border bg-white px-2 py-2 shadow-[0_-8px_24px_rgba(15,42,68,0.08)] lg:hidden">
          {navItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-2 text-[11px] font-semibold ${
                  isActive ? "bg-secondary/10 text-secondary" : "text-text-muted"
                }`
              }
            >
              <Icon name={item.icon} className="text-[22px]" />
              <span className="max-w-full truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
