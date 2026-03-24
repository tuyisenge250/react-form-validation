import { useState, useMemo, useCallback } from 'react'
import './App.css'

const isUpperCase = (char) => char >= 'A' && char <= 'Z'
const isLowerCase = (char) => char >= 'a' && char <= 'z'
const isDigit     = (char) => char >= '0' && char <= '9'
const isSpecial   = (char) => !isUpperCase(char) && !isLowerCase(char) && !isDigit(char)

const VALIDATION_RULES = [
  {
    id: 'minLength',
    label: 'At least 8 characters',
    validate: (pwd) => pwd.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Contains an uppercase letter',
    validate: (pwd) => [...pwd].some(isUpperCase),
  },
  {
    id: 'lowercase',
    label: 'Contains a lowercase letter',
    validate: (pwd) => [...pwd].some(isLowerCase),
  },
  {
    id: 'digit',
    label: 'Contains a digit',
    validate: (pwd) => [...pwd].some(isDigit),
  },
  {
    id: 'special',
    label: 'Contains a special character',
    validate: (pwd) => [...pwd].some(isSpecial),
  },
]

function usePasswordValidation(rules) {
  const [password, setPassword] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  const requirements = useMemo(
    () => rules.map((rule) => ({ ...rule, isValid: rule.validate(password) })),
    [password, rules]
  )

  const isFormValid = requirements.every((req) => req.isValid)

  const toggleVisibility = useCallback(
    () => setIsVisible((prev) => !prev),
    []
  )

  return { password, setPassword, isVisible, toggleVisibility, requirements, isFormValid }
}

function PasswordRequirement({ label, isValid }) {
  return (
    <div className={`requirement ${isValid ? 'valid' : 'invalid'}`}>
      <input
        type="checkbox"
        readOnly
        checked={isValid}
      />
      <label>{label}</label>
    </div>
  )
}

function App() {
  const {
    password,
    setPassword,
    isVisible,
    toggleVisibility,
    requirements,
    isFormValid,
  } = usePasswordValidation(VALIDATION_RULES)

  const handleSubmit = () => {
    console.log('Password submitted:', password)
  }

  return (
    <div className="password-card">
      <div className="card-header">
        <h1>Create Password</h1>
        <p>Enter a secure password</p>
      </div>

      <div className="input-group">
        <input
          type={isVisible ? 'text' : 'password'}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="button" className="toggle-btn" onClick={toggleVisibility}>
          {isVisible ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className="requirements-list">
        <h2>Password Requirements</h2>
        {requirements.map((req) => (
          <PasswordRequirement
            key={req.id}
            label={req.label}
            isValid={req.isValid}
          />
        ))}
      </div>

      <button type="button" className="submit-btn" disabled={!isFormValid} onClick={handleSubmit}>
        Submit
      </button>
    </div>
  )
}

export default App
