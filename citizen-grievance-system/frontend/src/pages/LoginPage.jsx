import { useState } from "react";
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
      const isAdminRole = role === "admin" || role === "super_admin" || role === "officer";
      if (portal === "admin" && !isAdminRole) {
        setMessage("This login is only for admin or officer accounts.");
        return;
      }
      if (portal === "citizen" && role !== "citizen") {
        setMessage("This login is only for citizen accounts. Use the admin login for staff access.");
        return;
      }
      const sessionScope = isAdminRole ? "admin" : "citizen";
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
          <p className="mt-2 text-sm text-text-muted">
            {portal === "admin" ? "Staff login for admin and officer panels." : "Citizen login to submit and track civic complaints."}
          </p>
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
              {portal === "admin" ? "Verify and Open Admin Panel" : "Verify and Continue"}
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
        </Card>
      </div>
    </main>
  );
}
