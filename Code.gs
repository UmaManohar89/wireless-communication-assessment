/**
 * Google Apps Script backend. Grades on the server, so browser-sent scores are never trusted.
 * Setup: bind this script to a Google Sheet (Extensions > Apps Script), run setup() once, then deploy as Web App.
 */
const MAX = 25, PASS_PCT = 40;
const SHOW_ANSWERS = true; // set false to hide answers/explanations after submission

// Answer key. MCQ/situation answers are indexes into the ORIGINAL option order in questions.js.
const KEY = {
  m1:[1,"The transmitter modulates and prepares the signal."], m2:[2,"The antenna radiates and captures waves."],
  m3:[0,"A band-pass filter passes a chosen band."], m4:[1,"Amplifiers raise signal level."],
  m5:[1,"Mixing produces sum and difference frequencies."], m6:[1,"An LNA boosts weak signals with little noise."],
  m7:[1,"The receiver recovers the message."], m8:[0,"LNAs add very little noise to weak signals."],
  m9:[2,"Mixers convert frequency."], m10:[1,"The transmit chain ends at the antenna."],
  t1:["Antenna","Antenna: radiates and captures waves."], t2:["Filter","Filter: blocks unwanted frequencies."],
  t3:["Mixer","Mixer: frequency conversion."], t4:["Receiver","Receiver: recovers the message."], t5:["Transmitter","Transmitter: prepares and sends the RF signal."],
  s1:[0,"A filter rejects out-of-band interference."], s2:[1,"A low-noise amplifier goes first in the receiver."],
  s3:[0,"A mixer down-converts to the intermediate frequency."], s4:[2,"A high-gain antenna improves directional coverage."], s5:[0,"The transmitter modulates speech onto a carrier."]
};
const HEAD = ["Timestamp","Student Name","Register Number","Department","Year / Section","Subject","Topic","MCQ Marks","Match-the-Following Marks","Situation-Based Marks","Total Marks","Maximum Marks","Percentage","Performance Level","Assessment Status","Attempt ID"];
const QIDS = Object.keys(KEY);

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  [["Results", HEAD], ["Responses", ["Attempt ID","Register Number"].concat(QIDS)], ["Roster", ["Register Number","Student Name"]]].forEach(([n, h]) => {
    const s = ss.getSheetByName(n) || ss.insertSheet(n);
    if (s.getLastRow() === 0) s.appendRow(h);
    s.setFrozenRows(1); s.getRange(1, 1, 1, h.length).setFontWeight("bold").setBackground("#e8f0fb");
  });
  buildDashboard();
}
function onOpen() { SpreadsheetApp.getUi().createMenu("Teacher").addItem("Refresh dashboard", "buildDashboard").addToUi(); }

function doGet() { return json({ ok: true, service: "Wireless learning API" }); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const b = JSON.parse(e.postData.contents), s = b.student || {};
    const clean = v => String(v || "").trim().replace(/^[=+\-@]/, "'$&").slice(0, 80); // blocks formula injection
    const f = { name: clean(s.name), reg: clean(s.reg).toUpperCase(), dept: clean(s.dept), year: clean(s.year) };
    if (!f.name || !f.reg || !f.dept || !f.year) return json({ ok: false, error: "All student details are required." });
    if (!/^[A-Za-z0-9\-\/]{3,30}$/.test(String(s.reg || "").trim())) return json({ ok: false, error: "Invalid register number." });
    const id = String(b.attemptId || "");
    if (!/^[\w\-]{8,64}$/.test(id)) return json({ ok: false, error: "Invalid attempt ID." });

    const ss = SpreadsheetApp.getActiveSpreadsheet(), res = ss.getSheetByName("Results"), n = res.getLastRow();
    if (n > 1) {
      const rows = res.getRange(2, 1, n - 1, HEAD.length).getValues();
      if (rows.some(r => r[15] === id)) return json({ ok: false, error: "This attempt was already recorded." });
      if (rows.some(r => String(r[2]).toUpperCase() === f.reg)) return json({ ok: false, error: "This register number has already submitted." });
    }
    // Grade on the server
    const a = b.answers || {}, ok = {}, part = { m: 0, t: 0, s: 0 }, review = [];
    QIDS.forEach(q => {
      const p = q[0], given = p === "m" ? (a.mcq || {})[q] : p === "t" ? (a.match || {})[q] : (a.sit || {})[q];
      const good = given === KEY[q][0]; ok[q] = good ? 1 : 0;
      if (good) part[p] += (p === "s" ? 2 : 1);
      const ans = (p === "t") ? KEY[q][0] : "option " + (KEY[q][0] + 1) + " in original order";
      review.push({ id: q, ok: good, answer: p === "t" ? KEY[q][0] : "see explanation", why: KEY[q][1] });
    });
    const total = part.m + part.t + part.s, pct = Math.round(total / MAX * 1000) / 10;
    const level = pct >= 80 ? "Excellent" : pct >= 60 ? "Good" : pct >= PASS_PCT ? "Satisfactory" : "Needs improvement";
    const status = pct >= PASS_PCT ? "Pass" : "Fail", now = new Date();
    res.appendRow([now, f.name, f.reg, f.dept, f.year, clean(b.subject), clean(b.topic), part.m, part.t, part.s, total, MAX, pct, level, status, id]);
    ss.getSheetByName("Responses").appendRow([id, f.reg].concat(QIDS.map(q => ok[q])));
    const correct = QIDS.filter(q => ok[q]).length;
    const feedback = pct >= 80 ? "Excellent work. You understand how the components fit together." : pct >= 60 ? "Good effort. Revisit the topics you missed in the Learn section." : pct >= PASS_PCT ? "You passed. Review filters, amplifiers and mixers, then practise again." : "Please review the Learn section and the practice activities, then speak to your teacher.";
    return json({ ok: true, result: { name: f.name, reg: f.reg, total: total, max: MAX, pct: pct, correct: correct, incorrect: QIDS.length - correct, level: level, feedback: feedback,
      time: Utilities.formatDate(now, Session.getScriptTimeZone(), "dd MMM yyyy, HH:mm:ss") }, review: SHOW_ANSWERS ? review : null });
  } catch (err) { return json({ ok: false, error: "Server error. Please try again." });
  } finally { lock.releaseLock(); }
}
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/** Teacher dashboard sheet (formulas update live). Paste your class list in the Roster sheet. */
function buildDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet(), d = ss.getSheetByName("Dashboard") || ss.insertSheet("Dashboard", 0);
  d.clear();
  d.getRange("A1:B7").setFormulas([
    ["Students attempted", "=COUNTA(Results!C2:C)"], ["Average score", '=IFERROR(AVERAGE(Results!K2:K),0)'],
    ["Highest score", '=IFERROR(MAX(Results!K2:K),0)'], ["Lowest score", '=IFERROR(MIN(Results!K2:K),0)'],
    ["Pass percentage", '=IFERROR(COUNTIF(Results!O2:O,"Pass")/COUNTA(Results!C2:C),0)'], ["Maximum marks", MAX], ["Roster size", "=COUNTA(Roster!A2:A)"]]);
  d.getRange("B5").setNumberFormat("0.0%");
  d.getRange("D1").setValue("Question-wise % correct").setFontWeight("bold");
  QIDS.forEach((q, i) => { d.getRange(2 + i, 4).setValue(q); d.getRange(2 + i, 5).setFormula("=IFERROR(AVERAGE(Responses!" + col(3 + i) + "2:" + col(3 + i) + "),0)").setNumberFormat("0%"); });
  d.getRange("G1").setValue("Not yet attempted (from Roster)").setFontWeight("bold");
  d.getRange("G2").setFormula('=IFERROR(FILTER(Roster!A2:B, Roster!A2:A<>"", COUNTIF(Results!C2:C, Roster!A2:A)=0),"Everyone has attempted, or Roster is empty")');
  d.getRange("A1:A7").setFontWeight("bold"); d.autoResizeColumns(1, 7);
}
function col(n) { let s = ""; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26; } return s; }
