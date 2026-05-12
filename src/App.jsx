import { useState, useEffect } from "react";

/* ── helpers ── */
const getToday = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
};

const STATUS_OPTIONS = ["", "Landed", "Delivered", "Already Run", "In Progress", "Done", "Pending", "Blocked"];

const STATUS_COLOR = {
  Landed: "#34d399", Delivered: "#60a5fa", "Already Run": "#a78bfa",
  "In Progress": "#fbbf24", Done: "#34d399", Pending: "#9ca3af",
  Blocked: "#f87171", "": "#374151",
};

const BLOCKER_PRESETS = [
  "Hardware can't be positioned because of load bank testing",
  "Vendors blocked from working because of load bank testing",
  "Optics delivery delayed",
  "Brick landing delayed",
  "PR landing delayed",
];

const NEXT_STEP_PRESETS = [
  "Morpheus Troubleshoot",
  "Brick Hand Off",
  "Brick turn up",
  "Cut power up ticket",
];

const defaultForm = {
  brick: "", patchRack: "", optics: "",
  trunkCable: "", harnesses: "", managementCable: "", copperCable: "",
  blockers: [],
  customBlocker: "",
  pfhoDate: "",
  primaryOwner: "",
  secondaryOwner: "",
  nextSteps: [...NEXT_STEP_PRESETS],
  customNextStep: "",
  completion: "",
};

/* ── sub-components ── */
const Dot = ({ color }) => (
  <span style={{
    display: "inline-block", width: 7, height: 7, borderRadius: "50%",
    background: color || "#374151", marginRight: 8, flexShrink: 0,
    boxShadow: `0 0 6px ${color || "#374151"}88`,
  }} />
);

const SectionHead = ({ icon, children }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
    textTransform: "uppercase", color: "#6b7280",
    paddingBottom: 8, marginTop: 22, marginBottom: 12,
    borderBottom: "1px solid #161f2e",
  }}>
    <span style={{ fontSize: 13 }}>{icon}</span>{children}
  </div>
);

const SelectField = ({ label, field, form, set }) => (
  <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
    <Dot color={STATUS_COLOR[form[field]]} />
    <label style={{ fontSize: 11, color: "#6b7280", width: 130, flexShrink: 0, fontWeight: 500 }}>
      {label}
    </label>
    <div style={{ position: "relative", flex: 1 }}>
      <select
        value={form[field]}
        onChange={e => set(f => ({ ...f, [field]: e.target.value }))}
        style={{
          width: "100%", background: "#0a1020", border: "1px solid #1e2d45",
          borderRadius: 6, color: form[field] ? "#e2e8f0" : "#4b5563",
          padding: "7px 28px 7px 10px", fontSize: 12,
          fontFamily: "inherit", cursor: "pointer", appearance: "none", outline: "none",
        }}
      >
        {STATUS_OPTIONS.map(o => (
          <option key={o} value={o} style={{ background: "#0a1020" }}>{o || "— select —"}</option>
        ))}
      </select>
      <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "#4b5563", fontSize: 9, pointerEvents: "none" }}>▾</span>
    </div>
  </div>
);

const TextInput = ({ placeholder, value, onChange }) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={{
      width: "100%", boxSizing: "border-box",
      background: "#0a1020", border: "1px solid #1e2d45",
      borderRadius: 6, color: "#e2e8f0",
      padding: "7px 10px", fontSize: 12, fontFamily: "inherit",
      outline: "none",
    }}
    onFocus={e => e.target.style.borderColor = "#2563eb"}
    onBlur={e => e.target.style.borderColor = "#1e2d45"}
  />
);

const Btn = ({ onClick, children, variant = "secondary", disabled }) => {
  const v = {
    primary: { bg: "#1d4ed8", color: "#fff", border: "#2563eb" },
    secondary: { bg: "#111827", color: "#d1d5db", border: "#1f2937" },
    danger: { bg: "transparent", color: "#6b7280", border: "#1f2937" },
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: v.bg, color: v.color, border: `1px solid ${v.border}`,
      borderRadius: 6, padding: "8px 18px", fontSize: 11, fontWeight: 700,
      fontFamily: "inherit", cursor: disabled ? "not-allowed" : "pointer",
      letterSpacing: "0.07em", textTransform: "uppercase",
      opacity: disabled ? 0.4 : 1, transition: "opacity 0.15s",
    }}>
      {children}
    </button>
  );
};

/* ── main ── */
export default function App() {
  const [date] = useState(getToday());
  const [form, setForm] = useState(() => {
    try {
      const s = localStorage.getItem("dsug-v2");
      return s ? JSON.parse(s) : defaultForm;
    } catch { return defaultForm; }
  });
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem("dsug-v2", JSON.stringify(form));
  }, [form]);

  const toggleBlocker = (b) =>
    setForm(f => ({
      ...f,
      blockers: f.blockers.includes(b) ? f.blockers.filter(x => x !== b) : [...f.blockers, b],
    }));

  const addCustomBlocker = () => {
    if (!form.customBlocker.trim()) return;
    setForm(f => ({ ...f, blockers: [...f.blockers, f.customBlocker.trim()], customBlocker: "" }));
  };

  const toggleNextStep = (s) =>
    setForm(f => ({
      ...f,
      nextSteps: f.nextSteps.includes(s) ? f.nextSteps.filter(x => x !== s) : [...f.nextSteps, s],
    }));

  const addCustomStep = () => {
    if (!form.customNextStep.trim()) return;
    setForm(f => ({ ...f, nextSteps: [...f.nextSteps, f.customNextStep.trim()], customNextStep: "" }));
  };

  const generate = () => {
    const chk = "✔";
    const bl = form.blockers.length
      ? form.blockers.map(b => `   ${chk} ${b}`).join("\n")
      : `   (none)`;
    const ns = form.nextSteps.length
      ? form.nextSteps.map(s => `  ${chk} ${s}`).join("\n")
      : `  (none)`;
    const pfho = form.pfhoDate.trim() || "N/A";
    const pct = form.completion.trim() ? `${form.completion.trim()}%` : "__%";

    setOutput(
      `Update as of ${date}\n\n` +
      `· Hardware Status\n` +
      `   ${chk} Brick - ${form.brick || "N/A"}\n` +
      `   ${chk} Patch Rack - ${form.patchRack || "N/A"}\n` +
      `   ${chk} Optics - ${form.optics || "N/A"}\n\n` +
      `· Cabling Status\n` +
      `   ${chk} Trunk Cable - ${form.trunkCable || "N/A"}\n` +
      `   ${chk} Harnesses - ${form.harnesses || "N/A"}\n` +
      `   ${chk} Management Cable - ${form.managementCable || "N/A"}\n` +
      `   ${chk} Copper Cable - ${form.copperCable || "N/A"}\n\n` +
      `· Blockers\n${bl}\n\n` +
      `· Planned PFHO/RZC/SCR - ${pfho}\n\n` +
      `· Project Owner\n` +
      `   ${chk} Primary - ${form.primaryOwner.trim() || "N/A"}\n` +
      `   ${chk} Secondary - ${form.secondaryOwner.trim() || "N/A"}\n\n` +
      `Next Steps\n${ns}\n\n` +
      `Project Completion as of right now - ${pct}`
    );
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setForm(defaultForm);
    setOutput("");
    localStorage.removeItem("dsug-v2");
  };

  const allSteps = [...new Set([...NEXT_STEP_PRESETS, ...form.nextSteps])];

  return (
    <div style={{
      minHeight: "100vh", background: "#050d1a", color: "#cbd5e1",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      padding: "28px 20px", boxSizing: "border-box",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{
            background: "#1d4ed8", color: "#fff", fontSize: 10, fontWeight: 700,
            padding: "3px 8px", borderRadius: 4, letterSpacing: "0.1em",
          }}>DAILY OPS</span>
          <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", color: "#f1f5f9" }}>
            Status Update Generator
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: 11, color: "#374151", letterSpacing: "0.04em" }}>
          {date} · auto-saved
        </p>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ background: "#080f1e", border: "1px solid #0f1e35", borderRadius: 10, padding: "18px 20px" }}>

          <SectionHead icon="🖥️">Hardware Status</SectionHead>
          <SelectField label="Brick" field="brick" form={form} set={setForm} />
          <SelectField label="Patch Rack" field="patchRack" form={form} set={setForm} />
          <SelectField label="Optics" field="optics" form={form} set={setForm} />

          <SectionHead icon="🔌">Cabling Status</SectionHead>
          <SelectField label="Trunk Cable" field="trunkCable" form={form} set={setForm} />
          <SelectField label="Harnesses" field="harnesses" form={form} set={setForm} />
          <SelectField label="Mgmt Cable" field="managementCable" form={form} set={setForm} />
          <SelectField label="Copper Cable" field="copperCable" form={form} set={setForm} />

          <SectionHead icon="🚧">Blockers</SectionHead>
          {BLOCKER_PRESETS.map(b => (
            <label key={b} style={{
              display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7,
              cursor: "pointer", fontSize: 11, lineHeight: 1.4,
              color: form.blockers.includes(b) ? "#93c5fd" : "#4b5563",
            }}>
              <input type="checkbox" checked={form.blockers.includes(b)}
                onChange={() => toggleBlocker(b)}
                style={{ marginTop: 2, accentColor: "#2563eb", flexShrink: 0 }} />
              {b}
            </label>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <TextInput
              placeholder="Custom blocker…"
              value={form.customBlocker}
              onChange={e => setForm(f => ({ ...f, customBlocker: e.target.value }))}
            />
            <button onClick={addCustomBlocker} style={{
              background: "#0f1e35", border: "1px solid #1e2d45", borderRadius: 6,
              color: "#60a5fa", cursor: "pointer", padding: "0 12px", fontSize: 16, flexShrink: 0,
            }}>+</button>
          </div>

          <SectionHead icon="📅">Planned PFHO / RZC / SCR</SectionHead>
          <TextInput
            placeholder="MM/DD/YYYY or N/A"
            value={form.pfhoDate}
            onChange={e => setForm(f => ({ ...f, pfhoDate: e.target.value }))}
          />

          <SectionHead icon="👤">Project Owner</SectionHead>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 10, color: "#6b7280", marginBottom: 4, display: "block" }}>Primary</label>
            <TextInput
              placeholder="Name or alias"
              value={form.primaryOwner}
              onChange={e => setForm(f => ({ ...f, primaryOwner: e.target.value }))}
            />
          </div>
          <div>
            <label style={{ fontSize: 10, color: "#6b7280", marginBottom: 4, display: "block" }}>Secondary</label>
            <TextInput
              placeholder="Name or alias"
              value={form.secondaryOwner}
              onChange={e => setForm(f => ({ ...f, secondaryOwner: e.target.value }))}
            />
          </div>

          <SectionHead icon="➡️">Next Steps</SectionHead>
          {allSteps.map(s => (
            <label key={s} style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 7,
              cursor: "pointer", fontSize: 11,
              color: form.nextSteps.includes(s) ? "#86efac" : "#4b5563",
            }}>
              <input type="checkbox" checked={form.nextSteps.includes(s)}
                onChange={() => toggleNextStep(s)}
                style={{ accentColor: "#16a34a" }} />
              {s}
            </label>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <TextInput
              placeholder="Custom next step…"
              value={form.customNextStep}
              onChange={e => setForm(f => ({ ...f, customNextStep: e.target.value }))}
            />
            <button onClick={addCustomStep} style={{
              background: "#0f1e35", border: "1px solid #1e2d45", borderRadius: 6,
              color: "#4ade80", cursor: "pointer", padding: "0 12px", fontSize: 16, flexShrink: 0,
            }}>+</button>
          </div>

          <SectionHead icon="📊">Project Completion</SectionHead>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TextInput
              placeholder="0"
              value={form.completion}
              onChange={e => setForm(f => ({ ...f, completion: e.target.value.replace(/[^0-9]/g, "") }))}
            />
            <span style={{ color: "#6b7280", fontSize: 14, flexShrink: 0 }}>%</span>
          </div>
          {form.completion && (
            <div style={{ marginTop: 10, background: "#0a1020", borderRadius: 6, height: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 6,
                width: `${Math.min(100, parseInt(form.completion) || 0)}%`,
                background: "linear-gradient(90deg, #1d4ed8, #34d399)",
                transition: "width 0.4s ease",
              }} />
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
            <Btn variant="primary" onClick={generate}>⚡ Generate</Btn>
            <Btn onClick={copy} disabled={!output}>{copied ? "✓ Copied!" : "⎘ Copy"}</Btn>
            <Btn variant="danger" onClick={reset}>↺ Reset</Btn>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          background: "#080f1e", border: "1px solid #0f1e35", borderRadius: 10,
          padding: "18px 20px", position: "sticky", top: 20,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "#374151",
            marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #0f1e35",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span>Output Preview</span>
            {output && (
              <span style={{ color: "#1d4ed8", cursor: "pointer", fontSize: 10 }} onClick={copy}>
                {copied ? "✓ copied" : "copy →"}
              </span>
            )}
          </div>
          {output ? (
            <pre style={{
              margin: 0, whiteSpace: "pre-wrap", fontSize: 12, lineHeight: 1.85,
              color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace",
              wordBreak: "break-word",
            }}>
              {output.split("\n").map((line, i) => {
                const isHeader = line.startsWith("·") || line.startsWith("Update as of") || line.startsWith("Next Steps") || line.startsWith("Project Completion");
                return (
                  <span key={i} style={{
                    display: "block",
                    color: isHeader ? "#e2e8f0" : "#64748b",
                    fontWeight: isHeader ? 700 : 400,
                  }}>
                    {line || "\u00A0"}
                  </span>
                );
              })}
            </pre>
          ) : (
            <div style={{ color: "#1e2d45", fontSize: 11, textAlign: "center", marginTop: 80, lineHeight: 2 }}>
              Fill in the form and hit<br />
              <span style={{ color: "#1d4ed8", fontWeight: 700 }}>⚡ Generate</span> to preview
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
