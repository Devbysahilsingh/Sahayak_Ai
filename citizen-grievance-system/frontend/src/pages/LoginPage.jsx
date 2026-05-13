import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setCurrentUser, setToken } from "../lib/api";
import { Button, Card, Field, Icon, inputClass } from "../components/ui";

export default function LoginPage({ portal = "citizen" }) {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    setLoading(true);
    setMessage("");
    try {
      const data = await api.sendOtp(mobile);
      setDevOtp(data.dev_otp || "");
      setOtp(data.dev_otp || "");
      setMessage(data.note || "OTP generated.");
    } catch (error) {
      setMessage(error.message || "Could not generate OTP. Make sure the Django backend is running.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await api.verifyOtp(mobile, otp);
      const role = data.user?.role;
      const isAdminRole = role === "admin" || role === "super_admin";
      const isWorkerRole = role === "officer";
      if (portal === "admin" && !isAdminRole) {
        setMessage("This login is only for admin accounts.");
        return;
      }
      if (portal === "worker" && !isWorkerRole) {
        setMessage("This login is only for registered worker accounts.");
        return;
      }
      if (portal === "citizen" && role !== "citizen") {
        setMessage("This login is only for citizen accounts. Use the admin or worker login for staff access.");
        return;
      }
      const sessionScope = isAdminRole ? "admin" : isWorkerRole ? "worker" : "citizen";
      setToken(data.token, sessionScope);
      setCurrentUser(data.user, sessionScope);
      if (data.user?.role === "admin" || data.user?.role === "super_admin") {
        navigate("/admin");
      } else if (data.user?.role === "officer") {
        navigate("/officer");
      } else {
        navigate("/my-grievances");
      }
    } catch (error) {
      setMessage(error.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-muted p-4">
      <div className="w-full max-w-[480px]">
        <header className="mb-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-white">
              <Icon name="account_balance" className="text-[34px]" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-primary">Smart Grievance Routing System</h1>
          <p className="mt-2 text-sm text-text-muted">{portalCopy[portal]?.subtitle || portalCopy.citizen.subtitle}</p>
          <div className="mt-5 inline-flex rounded-md border border-border bg-white p-1 shadow-sm">
            <Link
              className={`rounded px-4 py-2 text-sm font-semibold ${
                portal === "citizen" ? "bg-primary text-white" : "text-text-muted hover:bg-surface-soft"
              }`}
              to="/login"
            >
              User
            </Link>
            <Link
              className={`rounded px-4 py-2 text-sm font-semibold ${
                portal === "worker" ? "bg-primary text-white" : "text-text-muted hover:bg-surface-soft"
              }`}
              to="/worker/login"
            >
              Worker
            </Link>
            <Link
              className={`rounded px-4 py-2 text-sm font-semibold ${
                portal === "admin" ? "bg-primary text-white" : "text-text-muted hover:bg-surface-soft"
              }`}
              to="/admin/login"
            >
              Admin
            </Link>
          </div>
        </header>

        <Card className="p-8">
          <form className="space-y-6" onSubmit={verifyOtp}>
            <Field label="Mobile Number">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-text-muted">+91</span>
                <input
                  className={`${inputClass} pl-12 font-mono`}
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value)}
                  placeholder="9876543210"
                  type="tel"
                />
              </div>
            </Field>

            <Button type="button" variant="secondary" className="w-full" onClick={sendOtp} disabled={loading || !mobile}>
              <Icon name="sms" />
              Generate OTP
            </Button>

            <Field label="Enter OTP">
              <input
                className={`${inputClass} text-center font-mono text-lg tracking-[0.6em]`}
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                maxLength={6}
                placeholder="000000"
              />
            </Field>

            <Button type="submit" className="w-full py-3" disabled={loading || !mobile || otp.length < 6}>
              {portal === "admin" ? "Verify and Open Admin Panel" : portal === "worker" ? "Verify and Open Worker Dashboard" : "Verify and Continue"}
              <Icon name="arrow_forward" />
            </Button>
          </form>

          <div className="mt-8 rounded-md border border-border bg-surface-soft p-4">
            <div className="flex gap-3">
              <Icon name="info" className="text-secondary" />
              <p className="text-sm leading-relaxed text-text-muted">
                <span className="font-semibold text-primary">Note:</span> Prototype OTP is generated by the system. No SMS
                provider or token is used in this version.
                {devOtp ? <span className="block font-mono text-primary">Current OTP: {devOtp}</span> : null}
              </p>
            </div>
          </div>
          {message ? <p className="mt-4 text-sm text-text-muted">{message}</p> : null}
          {portal === "worker" ? (
            <p className="mt-4 text-center text-sm text-text-muted">
              New worker?{" "}
              <Link className="font-semibold text-secondary hover:underline" to="/worker/signup">
                Create worker profile
              </Link>
            </p>
          ) : null}
        </Card>
      </div>
    </main>
  );
}

const portalCopy = {
  citizen: { subtitle: "Citizen login to submit and track civic complaints." },
  worker: { subtitle: "Worker login for nearby department field jobs." },
  admin: { subtitle: "Admin login for review, monitoring, and governance controls." },
};

export function WorkerSignupPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: "",
    mobile_number: "",
    department_id: "",
  });
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .listDepartments()
      .then((data) => {
        const rows = data.results || [];
        setDepartments(rows);
        setForm((current) => ({ ...current, department_id: current.department_id || rows[0]?.id || "" }));
      })
      .catch(() => setDepartments([]));
  }, []);

  async function signup(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const data = await api.signupWorker(form);
      setDevOtp(data.dev_otp || "");
      setOtp(data.dev_otp || "");
      setMessage(data.note || "Worker profile created. Enter OTP to continue.");
    } catch (error) {
      setMessage(error.message || "Could not create worker profile.");
    } finally {
      setLoading(false);
    }
  }

  async function verify(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const data = await api.verifyOtp(form.mobile_number, otp);
      if (data.user?.role !== "officer") {
        setMessage("This mobile number is not registered as a worker.");
        return;
      }
      setToken(data.token, "worker");
      setCurrentUser(data.user, "worker");
      navigate("/officer");
    } catch (error) {
      setMessage(error.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-muted p-4">
      <div className="w-full max-w-[540px]">
        <header className="mb-8 text-center">
          <div className="mb-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-white">
              <Icon name="engineering" className="text-[34px]" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-primary">Worker Signup</h1>
          <p className="mt-2 text-sm text-text-muted">Create a worker profile linked to one government department.</p>
        </header>

        <Card className="p-8">
          <form className="space-y-5" onSubmit={signup}>
            <Field label="Worker Name">
              <input
                className={inputClass}
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Worker full name"
              />
            </Field>
            <Field label="Mobile Number">
              <input
                className={inputClass}
                value={form.mobile_number}
                onChange={(event) => setForm((current) => ({ ...current, mobile_number: event.target.value }))}
                placeholder="9876543210"
                type="tel"
              />
            </Field>
            <Field label="Department">
              <select
                className={inputClass}
                value={form.department_id}
                onChange={(event) => setForm((current) => ({ ...current, department_id: event.target.value }))}
              >
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </Field>
            <Button type="submit" variant="secondary" className="w-full" disabled={loading || !form.name || !form.mobile_number || !form.department_id}>
              <Icon name="badge" /> Create Worker and Generate OTP
            </Button>
          </form>

          <form className="mt-6 space-y-5 border-t border-border pt-6" onSubmit={verify}>
            <Field label="Enter OTP">
              <input
                className={`${inputClass} text-center font-mono text-lg tracking-[0.6em]`}
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                maxLength={6}
                placeholder="000000"
              />
            </Field>
            <Button type="submit" className="w-full" disabled={loading || otp.length < 6}>
              Verify and Open Worker Dashboard
              <Icon name="arrow_forward" />
            </Button>
          </form>

          {devOtp ? <p className="mt-4 font-mono text-sm text-primary">Current OTP: {devOtp}</p> : null}
          {message ? <p className="mt-4 text-sm text-text-muted">{message}</p> : null}
          <p className="mt-5 text-center text-sm text-text-muted">
            Already registered?{" "}
            <Link className="font-semibold text-secondary hover:underline" to="/worker/login">
              Worker login
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}


