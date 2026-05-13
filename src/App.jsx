import { useState, useEffect } from "react";

const getToday = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
};

const STATUS_OPTIONS = [
  "", "Landed", "Delivered", "Already Run",
  "In Progress", "Done", "Pending", "Blocked",
];

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

/* ── Shared styles ── */
const S = {
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#666",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#000",
    border: "1px solid #333",
    borderRadius: 3,
    color: "#fff",
    padding: "8px 10px",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
  },
  select: {
    width: "100%",
    boxSizing: "border-box",
    background: "#000",
    border: "1px solid #333",
    borderRadius: 3,
    color: "#fff",
    padding: "8px 10px",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    appearance: "none",
    cursor: "pointer",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #222",
    margin: "20px 0",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#555",
    marginBottom: 12,
  },
};

/* ── Components ── */
const SelectField = ({ label, field, form, set }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={S.label}>{label}</label>
    <select
      value={form[field]}
      onChange={e => set(f => ({ ...f, [field]: e.target.value }))}
      style={{ ...S.select, color: form[field] ? "#fff" : "#555" }}
    >
      {STATUS_OPTIONS.map(o => (
        <option key={o} value={o} style={{ background: "#000" }}>
          {o || "Select status"}
        </option>
      ))}
    </select>
  </div>
);

const TextInput = ({ label, placeholder, value, onChange }) => (
  <div style={{ marginBottom: 12 }}>
    {label && <label style={S.label}>{label}</label>}
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={S.input}
      onFocus={e => (e.target.style.borderColor = "#fff")}
      onBlur={e => (e.target.style.borderColor = "#333")}
    />
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={S.sectionTitle}>{children}</div>
);

const ActionBtn = ({ onClick, children, primary, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: primary ? "#fff" : "#000",
      color: primary ? "#000" : "#fff",
      border: "1px solid #fff",
      borderRadius: 3,
      padding: "9px 20px",
      fontSize: 12,
      fontWeight: 700,
      fontFamily: "inherit",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.35 : 1,
      transition: "background 0.1s, color 0.1s",
    }}
    onMouseEnter={e => {
      if (disabled) return;
      e.target.style.background = primary ? "#e5e5e5" : "#111";
    }}
    onMouseLeave={e => {
      if (disabled) return;
      e.target.style.background = primary ? "#fff" : "#000";
    }}
  >
    {children}
  </button>
);

/* ── App ── */
export default function App() {
  const [date] = useState(getToday());
  const [form, setForm] = useState(() => {
    try {
      const s = localStorage.getItem("dsug-v3");
      return s ? JSON.parse(s) : defaultForm;
    } catch { return defaultForm; }
  });
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem("dsug-v3", JSON.stringify(form));
  }, [form]);

  const toggleBlocker = b =>
    setForm(f => ({
      ...f,
      blockers: f.blockers.includes(b)
        ? f.blockers.filter(x => x !== b)
        : [...f.blockers, b],
    }));

  const addCustomBlocker = () => {
    if (!form.customBlocker.trim()) return;
    setForm(f => ({
      ...f,
      blockers: [...f.blockers, f.customBlocker.trim()],
      customBlocker: "",
    }));
  };

  const toggleNextStep = s =>
    setForm(f => ({
      ...f,
      nextSteps: f.nextSteps.includes(s)
        ? f.nextSteps.filter(x => x !== s)
        : [...f.nextSteps, s],
    }));

  const addCustomStep = () => {
    if (!form.customNextStep.trim()) return;
    setForm(f => ({
      ...f,
      nextSteps: [...f.nextSteps, f.customNextStep.trim()],
      customNextStep: "",
    }));
  };

  const generate = () => {
    const chk = "✔";
    const bl = form.blockers.length
      ? form.blockers.map(b => `   ${chk} ${b}`).join("\n")
      : "   (none)";
    const ns = form.nextSteps.length
      ? form.nextSteps.map(s => `  ${chk} ${s}`).join("\n")
      : "  (none)";
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
    localStorage.removeItem("dsug-v3");
  };

  const allSteps = [...new Set([...NEXT_STEP_PRESETS, ...form.nextSteps])];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      color: "#fff",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      fontSize: 13,
      boxSizing: "border-box",
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Top bar */}
      <div style={{
        borderBottom: "1px solid #222",
        padding: "14px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <span style={{
            fontSize: 13, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "#fff",
          }}>
            Daily Status Update Generator
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#444", letterSpacing: "0.06em" }}>
          {date}
        </span>
      </div>

      {/* Body */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 0,
        minHeight: "calc(100vh - 49px)",
      }}>

        {/* ── LEFT: Form ── */}
        <div style={{
          borderRight: "1px solid #222",
          padding: "28px 32px",
          overflowY: "auto",
        }}>

          <SectionTitle>Hardware Status</SectionTitle>
          <SelectField label="Brick" field="brick" form={form} set={setForm} />
          <SelectField label="Patch Rack" field="patchRack" form={form} set={setForm} />
          <SelectField label="Optics" field="optics" form={form} set={setForm} />

          <hr style={S.divider} />
          <SectionTitle>Cabling Status</SectionTitle>
          <SelectField label="Trunk Cable" field="trunkCable" form={form} set={setForm} />
          <SelectField label="Harnesses" field="harnesses" form={form} set={setForm} />
          <SelectField label="Management Cable" field="managementCable" form={form} set={setForm} />
          <SelectField label="Copper Cable" field="copperCable" form={form} set={setForm} />

          <hr style={S.divider} />
          <SectionTitle>Blockers</SectionTitle>
          {BLOCKER_PRESETS.map(b => (
            <label key={b} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              marginBottom: 10, cursor: "pointer",
              color: form.blockers.includes(b) ? "#fff" : "#555",
              fontSize: 12, lineHeight: 1.5,
            }}>
              <input
                type="checkbox"
                checked={form.blockers.includes(b)}
                onChange={() => toggleBlocker(b)}
                style={{ marginTop: 2, accentColor: "#fff", flexShrink: 0 }}
              />
              {b}
            </label>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input
              value={form.customBlocker}
              onChange={e => setForm(f => ({ ...f, customBlocker: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && addCustomBlocker()}
              placeholder="Add custom blocker..."
              style={{ ...S.input, flex: 1 }}
              onFocus={e => (e.target.style.borderColor = "#fff")}
              onBlur={e => (e.target.style.borderColor = "#333")}
            />
            <button
              onClick={addCustomBlocker}
              style={{
                background: "#000", border: "1px solid #333", borderRadius: 3,
                color: "#fff", cursor: "pointer", padding: "0 14px",
                fontSize: 18, flexShrink: 0, fontFamily: "inherit",
              }}
            >+</button>
          </div>

          <hr style={S.divider} />
          <TextInput
            label="Planned PFHO / RZC / SCR"
            placeholder="MM/DD/YYYY or N/A"
            value={form.pfhoDate}
            onChange={e => setForm(f => ({ ...f, pfhoDate: e.target.value }))}
          />

          <hr style={S.divider} />
          <SectionTitle>Project Owner</SectionTitle>
          <TextInput
            label="Primary"
            placeholder="Name or alias"
            value={form.primaryOwner}
            onChange={e => setForm(f => ({ ...f, primaryOwner: e.target.value }))}
          />
          <TextInput
            label="Secondary"
            placeholder="Name or alias"
            value={form.secondaryOwner}
            onChange={e => setForm(f => ({ ...f, secondaryOwner: e.target.value }))}
          />

          <hr style={S.divider} />
          <SectionTitle>Next Steps</SectionTitle>
          {allSteps.map(s => (
            <label key={s} style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 10, cursor: "pointer",
              color: form.nextSteps.includes(s) ? "#fff" : "#555",
              fontSize: 12,
            }}>
              <input
                type="checkbox"
                checked={form.nextSteps.includes(s)}
                onChange={() => toggleNextStep(s)}
                style={{ accentColor: "#fff" }}
              />
              {s}
            </label>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input
              value={form.customNextStep}
              onChange={e => setForm(f => ({ ...f, customNextStep: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && addCustomStep()}
              placeholder="Add custom step..."
              style={{ ...S.input, flex: 1 }}
              onFocus={e => (e.target.style.borderColor = "#fff")}
              onBlur={e => (e.target.style.borderColor = "#333")}
            />
            <button
              onClick={addCustomStep}
              style={{
                background: "#000", border: "1px solid #333", borderRadius: 3,
                color: "#fff", cursor: "pointer", padding: "0 14px",
                fontSize: 18, flexShrink: 0, fontFamily: "inherit",
              }}
            >+</button>
          </div>

          <hr style={S.divider} />
          <SectionTitle>Project Completion</SectionTitle>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              value={form.completion}
              onChange={e => setForm(f => ({ ...f, completion: e.target.value.replace(/[^0-9]/g, "") }))}
              placeholder="0"
              maxLength={3}
              style={{ ...S.input, width: 80, flexShrink: 0 }}
              onFocus={e => (e.target.style.borderColor = "#fff")}
              onBlur={e => (e.target.style.borderColor = "#333")}
            />
            <span style={{ color: "#555", fontSize: 13 }}>%</span>
            {form.completion && (
              <div style={{ flex: 1, background: "#111", borderRadius: 2, height: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${Math.min(100, parseInt(form.completion) || 0)}%`,
                  background: "#fff",
                  transition: "width 0.3s ease",
                }} />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            <ActionBtn primary onClick={generate}>Generate</ActionBtn>
            <ActionBtn onClick={copy} disabled={!output}>
              {copied ? "Copied" : "Copy"}
            </ActionBtn>
            <ActionBtn onClick={reset}>Reset</ActionBtn>
          </div>
        </div>

        {/* ── RIGHT: Output ── */}
        <div style={{ padding: "28px 32px" }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#444",
            marginBottom: 16, paddingBottom: 10,
            borderBottom: "1px solid #222",
            display: "flex", justifyContent: "space-between",
          }}>
            <span>Output</span>
            {output && (
              <span
                style={{ color: "#666", cursor: "pointer", fontWeight: 400 }}
                onClick={copy}
              >
                {copied ? "copied" : "copy"}
              </span>
            )}
          </div>

          {output ? (
            <pre style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              fontSize: 13,
              lineHeight: 1.9,
              color: "#ccc",
              fontFamily: "inherit",
              wordBreak: "break-word",
            }}>
              {output.split("\n").map((line, i) => {
                const isHeader =
                  line.startsWith("·") ||
                  line.startsWith("Update as of") ||
                  line === "Next Steps" ||
                  line.startsWith("Project Completion");
                return (
                  <span key={i} style={{
                    display: "block",
                    color: isHeader ? "#fff" : "#666",
                    fontWeight: isHeader ? 600 : 400,
                  }}>
                    {line || "\u00A0"}
                  </span>
                );
              })}
            </pre>
          ) : (
            <div style={{
              color: "#2a2a2a",
              fontSize: 12,
              marginTop: 100,
              textAlign: "center",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              Fill in the form and click Generate
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
