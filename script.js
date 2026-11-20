// Paste your deployed Apps Script Web App URL here (it is not a secret).
const API_URL = "";
const MINUTES = 20;
const SUBJECT = "Wireless Communication / Internet of Things";
const TOPIC = "Components of a Wireless Communication System";

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
let student = JSON.parse(sessionStorage.getItem("student") || "null"), timer = null, attemptId = null, order = null;

function show(v) {
  if (v === "assess" && !student) { v = "register"; $("#regMsg").textContent = "Please register before starting the assessment."; }
  $$("main > section").forEach(s => s.hidden = s.id !== v);
  $$("nav button").forEach(b => b.setAttribute("aria-current", b.dataset.v === v));
}
$$("nav button").forEach(b => b.onclick = () => show(b.dataset.v));

// ---------- Registration ----------
if (student) $$("#regForm input").forEach(i => i.value = student[i.name] || "");
$("#regForm").onsubmit = e => {
  e.preventDefault();
  const f = new FormData(e.target);
  student = { name: f.get("name").trim(), reg: f.get("reg").trim().toUpperCase(), dept: f.get("dept").trim(), year: f.get("year").trim() };
  sessionStorage.setItem("student", JSON.stringify(student));
  $("#regMsg").textContent = "Saved. You can now learn, practise or start the assessment.";
  show("learn");
};

// ---------- Learn ----------
$("#learnCards").innerHTML = NAMES.map(n => { const c = LEARN[n]; return `<article class="lc"><h3>${n}</h3><dl>
<dt>Definition</dt><dd>${c.def}</dd><dt>Function</dt><dd>${c.fn}</dd><dt>Working principle</dt><dd>${c.work}</dd>
<dt>Real-world applications</dt><dd>${c.app}</dd><dt>Practical example</dt><dd>${c.ex}</dd></dl></article>`; }).join("");

// ---------- Practice ----------
const ACTS = ["1. Match", "2. Identify", "3. Arrange", "4. Situations"];
$("#actTabs").innerHTML = ACTS.map((t, i) => `<button class="ghost" role="tab" data-a="${i}">${t}</button>`).join("");
$$("#actTabs button").forEach(b => b.onclick = () => act(+b.dataset.a));

function act(i) {
  $$("#actTabs button").forEach(b => b.setAttribute("aria-selected", +b.dataset.a === i));
  const el = $("#actBody");
  if (i === 0) {
    el.innerHTML = `<p>Match each function with its component.</p>` + MATCH_PRACTICE.map((m, k) =>
      `<label>${m.f}<select data-k="${k}"><option value="">Choose…</option>${NAMES.map(n => `<option>${n}</option>`).join("")}</select></label><div class="fb" id="f${k}"></div>`).join("") +
      `<button class="primary" id="chk">Check answers</button>`;
    $("#chk").onclick = () => {
      let ok = 0;
      $$("#actBody select").forEach(s => { const m = MATCH_PRACTICE[s.dataset.k], good = s.value === m.n; ok += good;
        const f = $("#f" + s.dataset.k); f.className = "fb " + (good ? "ok" : "no"); f.textContent = good ? "Correct." : `Not quite. This is the ${m.n}: ${LEARN[m.n].def}`; });
      $("#chk").textContent = `Score ${ok}/6. Check again`;
    };
  } else if (i === 2) {
    let items = shuffle(ARRANGE), sel = -1;
    const draw = () => {
      el.innerHTML = `<p>Arrange the blocks from source to destination. Drag them, or tap two blocks to swap.</p><ul class="drag">${items.map((t, k) => `<li draggable="true" data-k="${k}" tabindex="0" class="${k === sel ? "sel" : ""}">${t}</li>`).join("")}</ul><button class="primary" id="chk">Check order</button><div class="fb" id="fb"></div>`;
      const swap = (a, b) => { [items[a], items[b]] = [items[b], items[a]]; sel = -1; draw(); };
      $$(".drag li").forEach(li => {
        const k = +li.dataset.k;
        li.ondragstart = e => e.dataTransfer.setData("text", k);
        li.ondragover = e => e.preventDefault();
        li.ondrop = e => { e.preventDefault(); swap(+e.dataTransfer.getData("text"), k); };
        li.onclick = () => { if (sel < 0) { sel = k; draw(); } else if (sel === k) { sel = -1; draw(); } else swap(sel, k); };
        li.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); li.click(); } };
      });
      $("#chk").onclick = () => { const n = items.filter((t, k) => t === ARRANGE[k]).length;
        $("#fb").className = "fb " + (n === 6 ? "ok" : "no");
        $("#fb").textContent = n === 6 ? "Correct. The message flows source → transmitter → antenna → air → antenna → receiver → destination." : `${n}/6 in the right place. The transmitter prepares the signal, the antenna sends it, the receiving antenna captures it, and the receiver recovers it.`; };
    };
    draw();
  } else quiz(el, i === 1 ? IDENT : SITU_PRACTICE);
}
function quiz(el, items) {
  el.innerHTML = items.map((q, k) => `<div><p><b>${q.q}</b></p>${q.o.map((o, j) => `<button class="opt" data-k="${k}" data-j="${j}">${o}</button>`).join("")}<div class="fb" id="f${k}"></div></div>`).join("");
  $$("#actBody .opt").forEach(b => b.onclick = () => {
    const q = items[b.dataset.k], j = +b.dataset.j, good = j === q.a;
    $$(`#actBody .opt[data-k="${b.dataset.k}"]`).forEach(x => { x.disabled = true; if (+x.dataset.j === q.a) x.classList.add("ok"); });
    if (!good) b.classList.add("no");
    const f = $("#f" + b.dataset.k); f.className = "fb " + (good ? "ok" : "no"); f.textContent = (good ? "Correct. " : "Not quite. ") + q.e;
  });
}
act(0);

// ---------- Assessment ----------
const key = () => "attempt:" + student.reg;
$("#startBtn").onclick = () => {
  if (!student) return show("register");
  if (localStorage.getItem(key())) { $("#startMsg").textContent = "This register number has already started or submitted the assessment on this device."; return; }
  localStorage.setItem(key(), "started");
  attemptId = (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(36).slice(2));
  order = { mcq: shuffle(MCQ).map(q => ({ ...q, o: shuffle(q.o.map((t, i) => ({ t, i }))) })), sit: SITU.map(q => ({ ...q, o: shuffle(q.o.map((t, i) => ({ t, i }))) })) };
  const radios = (q) => `<div class="q"><p>${q.q}</p>${q.o.map(o => `<label><input type="radio" name="${q.id}" value="${o.i}">${esc(o.t)}</label>`).join("")}</div>`;
  $("#qList").innerHTML = `<h3>Part A: MCQs (10 marks)</h3>${order.mcq.map(radios).join("")}
    <h3>Part B: Match the following (5 marks)</h3>${MATCH.map(m => `<div class="q"><p>${m.f}</p><select name="${m.id}"><option value="">Choose…</option>${NAMES.map(n => `<option>${n}</option>`).join("")}</select></div>`).join("")}
    <h3>Part C: Situations (10 marks)</h3>${order.sit.map(radios).join("")}`;
  $("#assessIntro").hidden = true; $("#quiz").hidden = false;
  $("#qList").oninput = progress;
  const end = Date.now() + MINUTES * 60000;
  timer = setInterval(() => {
    const left = Math.max(0, end - Date.now()), m = Math.floor(left / 60000), s = Math.floor(left % 60000 / 1000);
    $("#clock").textContent = `${m}:${String(s).padStart(2, "0")}`;
    if (left <= 0) { clearInterval(timer); submit(); }
  }, 500);
};
function collect() {
  const a = { mcq: {}, match: {}, sit: {} };
  MCQ.forEach(q => { const r = document.querySelector(`input[name="${q.id}"]:checked`); a.mcq[q.id] = r ? +r.value : -1; });
  SITU.forEach(q => { const r = document.querySelector(`input[name="${q.id}"]:checked`); a.sit[q.id] = r ? +r.value : -1; });
  MATCH.forEach(m => a.match[m.id] = document.querySelector(`select[name="${m.id}"]`).value);
  return a;
}
function progress() {
  const a = collect(), all = [...Object.values(a.mcq), ...Object.values(a.sit), ...Object.values(a.match)];
  $("#prog").style.width = (all.filter(v => v !== -1 && v !== "").length / all.length * 100) + "%";
}
$("#submitBtn").onclick = () => submit();
async function submit() {
  clearInterval(timer);
  const btn = $("#submitBtn"), msg = $("#subMsg"); btn.disabled = true;
  if (!API_URL) { msg.textContent = "API_URL is not set in script.js. See README step 7."; btn.disabled = false; return; }
  msg.textContent = "Submitting…";
  const body = { attemptId, student, subject: SUBJECT, topic: TOPIC, answers: collect() };
  try {
    const r = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!d.ok) throw new Error(d.error || "Submission rejected");
    localStorage.setItem(key(), "submitted");
    showResult(d); show("result");
  } catch (e) { msg.textContent = "Could not submit: " + e.message + ". Your answers are kept. Select Submit again."; btn.disabled = false; }
}
function showResult(d) {
  const r = d.result;
  $("#resBody").innerHTML = `<div class="grid">${[["Student", r.name], ["Register number", r.reg], ["Total marks", r.max], ["Marks obtained", r.total], ["Percentage", r.pct + "%"], ["Correct answers", r.correct], ["Incorrect answers", r.incorrect], ["Performance level", r.level], ["Submitted", r.time]].map(([k, v]) => `<div>${k}<b>${esc(v)}</b></div>`).join("")}</div>
  <p>${esc(r.feedback)}</p>` + (d.review ? `<h3>Answers and explanations</h3>` + d.review.map(x => `<p class="fb ${x.ok ? "ok" : "no"}"><b>${esc(x.id.toUpperCase())}</b> ${x.ok ? "Correct" : "Incorrect"}. Answer: ${esc(x.answer)}. ${esc(x.why)}</p>`).join("") : "");
}
show(student ? "learn" : "register");
