# Password Validator — React Mental Model

A password creation form built to demonstrate clean React patterns without Redux.
Designed as a reference for interviews and learning.

---

## What it does

- Live validation of a password as the user types
- Five rules checked in real time, each shown as a checklist item
- Submit button stays disabled until all rules pass
- Show / Hide toggle for the password input

---

## Project Structure

```
src/
├── App.jsx   — all logic and components
└── App.css   — scoped styles for the card
```

---

## Architecture Overview

The code is split into three layers, all inside `App.jsx`:

```
Character Classifiers   →   pure helper functions
VALIDATION_RULES        →   config array (no logic, just data)
usePasswordValidation   →   custom hook (all state & logic)
PasswordRequirement     →   presentational component
App                     →   renders UI, calls the hook
```

---

## Layer-by-layer Explanation

### 1. Character Classifiers

```js
const isUpperCase = (char) => char >= 'A' && char <= 'Z'
const isLowerCase = (char) => char >= 'a' && char <= 'z'
const isDigit     = (char) => char >= '0' && char <= '9'
const isSpecial   = (char) => !isUpperCase(char) && !isLowerCase(char) && !isDigit(char)
```

Pure functions — no state, no side effects.
Character comparison works because JS string comparison is based on Unicode code points,
and the alphabets/digits sit in contiguous ranges:

| Range | Code points |
|---|---|
| `'0'` – `'9'` | 48 – 57 |
| `'A'` – `'Z'` | 65 – 90 |
| `'a'` – `'z'` | 97 – 122 |

`isSpecial` needs no positive definition — anything that is not upper, lower, or digit is special.

---

### 2. VALIDATION_RULES

```js
const VALIDATION_RULES = [
  { id: 'minLength', label: '...', validate: (pwd) => pwd.length >= 8 },
  { id: 'uppercase', label: '...', validate: (pwd) => [...pwd].some(isUpperCase) },
  // ...
]
```

Defined **outside the component** so the array reference never changes between renders.
Each rule is a plain object with:

| Field | Purpose |
|---|---|
| `id` | Stable React `key` and identifier |
| `label` | Text shown in the UI |
| `validate` | Pure function `(password) => boolean` |

**To add a new rule:** push one object here. No other file needs to change.

`[...pwd]` spreads the string into an array of characters so `.some()` can iterate over them.

---

### 3. `usePasswordValidation` — Custom Hook

```js
function usePasswordValidation(rules) {
  const [password, setPassword] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  const requirements = useMemo(
    () => rules.map((rule) => ({ ...rule, isValid: rule.validate(password) })),
    [password, rules]
  )

  const isFormValid = requirements.every((req) => req.isValid)

  const toggleVisibility = useCallback(() => setIsVisible((prev) => !prev), [])

  return { password, setPassword, isVisible, toggleVisibility, requirements, isFormValid }
}
```

**Why a custom hook?**
The component (`App`) becomes pure UI — it only renders what the hook gives it.
You can replace this hook (e.g. with one that calls an API) without touching any JSX.

**Key decisions:**

#### `requirements` uses `useMemo`, not `useState`

`requirements` is **derived state** — it is always a function of `password`.
Storing derived state in `useState` causes a stale-closure bug:

```js
// BROKEN — `password` here is the old value; setPassword hasn't run yet
const handleChange = (e) => {
  setPassword(e.target.value)
  setRequirements([{ isValid: password.length >= 8 }]) // stale!
}
```

`useMemo` computes `requirements` synchronously from the current `password`,
so validation is always in sync with what the user typed.

#### `isFormValid` is also derived

```js
const isFormValid = requirements.every((req) => req.isValid)
```

No `useState`, no separate `setDisable` call. It re-derives on every render
automatically when `requirements` changes.

#### `useCallback` on `toggleVisibility`

Produces a stable function reference. Safe to pass to child components without
causing unnecessary re-renders when the parent re-renders.

---

### 4. `PasswordRequirement` — Presentational Component

```jsx
function PasswordRequirement({ label, isValid }) {
  return (
    <div className={`requirement ${isValid ? 'valid' : 'invalid'}`}>
      <input type="checkbox" readOnly checked={isValid} aria-label={label} />
      <label>{label}</label>
    </div>
  )
}
```

Single responsibility: renders one requirement row.

- `readOnly` is required because `checked` is controlled by React but there is no `onChange`.
  Without `readOnly`, React emits a warning about a controlled input with no handler.
- The CSS class (`valid` / `invalid`) drives the green / grey color change.

---

### 5. `App` — Root Component

```jsx
function App() {
  const { password, setPassword, isVisible, toggleVisibility, requirements, isFormValid }
    = usePasswordValidation(VALIDATION_RULES)

  return (
    <div className="password-card">
      {/* header */}
      {/* input + show/hide button */}
      {/* requirements checklist */}
      {/* submit button — disabled until isFormValid */}
    </div>
  )
}
```

No logic here — only JSX. The component is purely responsible for layout and rendering.

---

## React Concepts Demonstrated

| Concept | Where |
|---|---|
| `useState` | `password`, `isVisible` in the hook |
| `useMemo` | `requirements` — avoids stale closure, skips unnecessary recalculation |
| `useCallback` | `toggleVisibility` — stable function reference |
| Derived state | `requirements` and `isFormValid` computed, not stored |
| Custom hook | `usePasswordValidation` — separates logic from UI |
| Controlled input | `value={password}` + `onChange` |
| `readOnly` input | `PasswordRequirement` checkbox — display-only controlled input |
| Component composition | `App` renders `PasswordRequirement` per rule |
| Config-driven UI | `VALIDATION_RULES` array drives both logic and display |

---

## How to Run

```bash
npm install
npm run dev
```
