# Components of a Wireless Communication System: Learning and Assessment App

An interactive web app for undergraduate students (Wireless Communication / IoT). Students learn six components (transmitter, receiver, antenna, filters, amplifiers, mixers), practise, then take a timed 25-mark assessment. Marks are graded on a Google Apps Script server and stored in Google Sheets.

## Learning objectives
Identify the components; explain transmitter and receiver functions; describe the antenna's role; understand filters, amplifiers and mixers; illustrate the block diagram; apply the ideas to real scenarios.

## Features
- Registration (name, register number, department, year/section) required before the assessment
- Learning module with definition, function, working principle, applications, example and a block diagram
- Four activities: match, identify, drag-and-drop arrangement (tap-to-swap on phones), situations
- Assessment: 10 MCQ (10) + 5 match (5) + 5 situations (10) = 25 marks, 20-minute timer, shuffled MCQs and options, auto-submit at timeout
- Results page with score, percentage, level, feedback, submission time, optional answers and explanations
- Server-side grading, duplicate-attempt prevention (attempt ID and register number), no secrets in the frontend
- Teacher dashboard inside the Google Sheet (attempts, average, highest, lowest, pass %, question-wise %, not-attempted list)

## Technologies
HTML5, CSS3, JavaScript, Google Apps Script, Google Sheets, GitHub Pages.

## Files
`index.html`, `style.css`, `script.js`, `questions.js` (public, no answers), `Code.gs` (backend with answer key), `README.md`.

## Run locally
Open `index.html` in a browser, or run `python3 -m http.server 8000` in this folder and visit `http://localhost:8000`. Learning and practice work offline; submission needs the Web App URL (below).

## Google Sheets and Apps Script setup
1. Create a new Google Sheet (e.g. "Wireless Assessment Results").
2. Open **Extensions > Apps Script**, delete the sample code, paste all of `Code.gs`, and save.
3. Select `setup` in the function dropdown and click **Run**. Approve the permission prompt. This creates the sheets `Results`, `Responses`, `Roster` and `Dashboard`.
4. Click **Deploy > New deployment > Web app**. Set *Execute as*: **Me**, *Who has access*: **Anyone**. Click **Deploy** and copy the URL ending in `/exec`.
5. Open `script.js` and set `const API_URL = "https://script.google.com/macros/s/XXXX/exec";`. This URL is not a secret: it only accepts answers, and the answer key stays on the server.
6. After any change to `Code.gs`, use **Deploy > Manage deployments > Edit > New version > Deploy**.
7. Paste your class list (register number, name) into the `Roster` sheet. In the Sheet, use **Teacher > Refresh dashboard** any time.

**Teacher access:** keep the Google Sheet private and share it only with teachers. Do not publish the sheet. Student records never appear in the public repository or frontend.

To hide answers after submission, set `SHOW_ANSWERS = false` in `Code.gs`.

## Publish on GitHub
1. Create a new **Public** repository on github.com.
2. Upload the files (**Add file > Upload files**), or use `git init`, `git add .`, `git commit -m "Initial"`, `git remote add origin <url>`, `git push -u origin main`.
3. Confirm `API_URL` is your Web App URL and nothing private is in the files.
4. Go to **Settings > Pages**, choose *Deploy from a branch*, branch `main`, folder `/ (root)`, and save.
5. After a minute, your link is `https://<username>.github.io/<repository>/`. Share it with students.

## Student access
Students open the public link, register, learn, practise and start the assessment. Each register number can attempt once.

## Test the workflow
1. Open the app, register as `TEST001`, take the assessment and submit.
2. Check the result page, then confirm a new row in `Results` and `Responses`. Marks in the sheet must match the page.
3. Submit again as `TEST001` (clear browser storage first): the server must reject it as a duplicate.
4. Delete the test rows before real use. Clear the `attempt:` key in browser localStorage to retest on the same device.

## Limitations
The one-attempt check in the browser is a convenience; the server rule on register number and attempt ID is the real enforcement. The 20-minute timer runs in the browser. Anyone with the public link can submit, so the register number is only checked against the Roster by you in the dashboard.
