import { useEffect, useState } from 'react'
import axios from 'axios'
import './components/Login.css'

const API = 'http://localhost:5000'

const INITIAL_LOGIN = { email: '', password: '' }
const INITIAL_SIGNUP = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
}

function Login({ onLogin }) {
  const [authMode, setAuthMode] = useState('login')
  const [loginRole, setLoginRole] = useState('student')
  const [signupRole, setSignupRole] = useState('student')
  const [loginData, setLoginData] = useState(INITIAL_LOGIN)
  const [signupData, setSignupData] = useState(INITIAL_SIGNUP)
  const [fieldStatus, setFieldStatus] = useState({})
  const [loginError, setLoginError] = useState('')
  const [toast, setToast] = useState('')
  const [successUser, setSuccessUser] = useState(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  const setMsg = (id, type) => {
    const classType = type === 'ok' ? 'valid' : type === 'err' ? 'error' : ''
    setFieldStatus((prev) => ({ ...prev, [id]: classType }))
  }

  const clearStatus = () => setFieldStatus({})

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const validatePhone = (value) => {
    if (!value.trim()) return true
    return /^[0-9+\-\s]{7,15}$/.test(value.trim())
  }

  const doLogin = async () => {
    clearStatus()
    setLoginError('')
    const emailValid = validateEmail(loginData.email)
    const passwordValid = loginData.password.length >= 6

    setMsg('loginEmail', emailValid ? 'ok' : 'err')
    setMsg('loginPassword', passwordValid ? 'ok' : 'err')

    if (!emailValid || !passwordValid) {
      setToast('⚠️ Please fix the highlighted fields.')
      return
    }

    try {
      const response = await axios.post(`${API}/api/auth/login`, {
        email: loginData.email.trim(),
        password: loginData.password,
        role: loginRole
      })

      setSuccessUser(response.data)
      onLogin(response.data)
      setToast(`🎉 Welcome ${response.data.name}`)
    } catch (error) {
      const serverError = error.response?.data?.error
      if (error.response?.status === 401) {
        setMsg('loginEmail', 'err')
        setMsg('loginPassword', 'err')
        setLoginError('Invalid login — there is a mistake in email or password.')
        setToast('⚠️ Invalid email or password.')
      } else {
        setToast(serverError || 'Login failed')
      }
    }
  }

  const doSignup = async () => {
    clearStatus()
    const firstNameValid = signupData.firstName.trim() !== ''
    const emailValid = validateEmail(signupData.email)
    const passwordValid = signupData.password.length >= 6
    const confirmValid = signupData.password === signupData.confirmPassword
    const phoneValid = validatePhone(signupData.phone)

    setMsg('signupFirstName', firstNameValid ? 'ok' : 'err')
    setMsg('signupEmail', emailValid ? 'ok' : 'err')
    setMsg('signupPassword', passwordValid ? 'ok' : 'err')
    setMsg('signupConfirmPassword', confirmValid ? 'ok' : 'err')
    setMsg('signupPhone', phoneValid ? 'ok' : 'err')

    if (!firstNameValid || !emailValid || !passwordValid || !confirmValid || !phoneValid) {
      if (!firstNameValid) {
        setToast('First name is required.')
      } else if (!emailValid) {
        setToast('Enter a valid email address.')
      } else if (!passwordValid) {
        setToast('Password must be at least 6 characters.')
      } else if (!confirmValid) {
        setToast('Passwords do not match.')
      } else {
        setToast('Enter a valid phone number or leave it blank.')
      }
      return
    }

    try {
      const response = await axios.post(`${API}/api/auth/signup`, {
        firstName: signupData.firstName.trim(),
        lastName: signupData.lastName.trim(),
        email: signupData.email.trim(),
        password: signupData.password,
        role: signupRole,
        phone: signupData.phone.trim()
      })

      setSuccessUser(response.data)
      onLogin(response.data)
      setToast('✅ Account created successfully')
    } catch (error) {
      setToast(error.response?.data?.error || 'Signup failed')
    }
  }

  const handleFieldChange = (section, field, value) => {
    if (section === 'login') {
      setLoginData({ ...loginData, [field]: value })
    } else {
      setSignupData({ ...signupData, [field]: value })
    }
  }

  return (
    <div className="login-page">
      <div className="auth-wrap">
        <div className="auth-card">
          {!successUser ? (
            <>
              <div className="auth-top">
                <span className="auth-logo">☕</span>
                <h2>PréstoBite</h2>
                <p>Your campus café</p>
              </div>

              <div className="auth-switch">
                <button className={`asw ${authMode === 'login' ? 'on' : ''}`} onClick={() => setAuthMode('login')}>
                  Sign In
                </button>
                <button className={`asw ${authMode === 'signup' ? 'on' : ''}`} onClick={() => setAuthMode('signup')}>
                  Create Account
                </button>
              </div>

              {authMode === 'login' && (
                <>
                  <div className="role-tabs">
                    <button onClick={() => setLoginRole('student')} className={`rtab ${loginRole === 'student' ? 'on' : ''}`}>
                      Student
                    </button>
                    <button onClick={() => setLoginRole('faculty')} className={`rtab ${loginRole === 'faculty' ? 'on' : ''}`}>
                      Faculty
                    </button>
                    <button onClick={() => setLoginRole('admin')} className={`rtab ${loginRole === 'admin' ? 'on' : ''}`}>
                      Admin
                    </button>
                  </div>

                  <div className="fg">
                    <label>Email</label>
                    <input className={fieldStatus.loginEmail} value={loginData.email} onChange={(e) => handleFieldChange('login', 'email', e.target.value)} />
                    {fieldStatus.loginEmail === 'error' && <span className="field-msg err">Invalid email — mistake detected</span>}
                  </div>

                  <div className="fg">
                    <label>Password</label>
                    <input className={fieldStatus.loginPassword} type="password" value={loginData.password} onChange={(e) => handleFieldChange('login', 'password', e.target.value)} />
                    {fieldStatus.loginPassword === 'error' && <span className="field-msg err">Invalid password — mistake detected</span>}
                    {loginError && <span className="field-msg err">{loginError}</span>}
                  </div>

                  <button className="btn-main" onClick={doLogin}>Sign In →</button>
                </>
              )}

              {authMode === 'signup' && (
                <>
                  <div className="role-tabs">
                    <button onClick={() => setSignupRole('student')} className={`rtab ${signupRole === 'student' ? 'on' : ''}`}>
                      Student
                    </button>
                    <button onClick={() => setSignupRole('faculty')} className={`rtab ${signupRole === 'faculty' ? 'on' : ''}`}>
                      Faculty
                    </button>
                  </div>

                  <div className="fg">
                    <label>First Name</label>
                    <input className={fieldStatus.signupFirstName} value={signupData.firstName} onChange={(e) => handleFieldChange('signup', 'firstName', e.target.value)} />
                    {fieldStatus.signupFirstName === 'error' && <span className="field-msg err">First name is required</span>}
                  </div>

                  <div className="fg">
                    <label>Last Name (optional)</label>
                    <input value={signupData.lastName} onChange={(e) => handleFieldChange('signup', 'lastName', e.target.value)} />
                  </div>

                  <div className="fg">
                    <label>Email</label>
                    <input className={fieldStatus.signupEmail} value={signupData.email} onChange={(e) => handleFieldChange('signup', 'email', e.target.value)} />
                    {fieldStatus.signupEmail === 'error' && <span className="field-msg err">Enter a valid email address</span>}
                  </div>

                  <div className="fg">
                    <label>Phone</label>
                    <input className={fieldStatus.signupPhone} value={signupData.phone} onChange={(e) => handleFieldChange('signup', 'phone', e.target.value)} />
                    {fieldStatus.signupPhone === 'error' && <span className="field-msg err">Phone number is invalid</span>}
                  </div>

                  <div className="fg">
                    <label>Password</label>
                    <input className={fieldStatus.signupPassword} type="password" value={signupData.password} onChange={(e) => handleFieldChange('signup', 'password', e.target.value)} />
                    {fieldStatus.signupPassword === 'error' && <span className="field-msg err">Password must be at least 6 characters</span>}
                  </div>

                  <div className="fg">
                    <label>Confirm Password</label>
                    <input className={fieldStatus.signupConfirmPassword} type="password" value={signupData.confirmPassword} onChange={(e) => handleFieldChange('signup', 'confirmPassword', e.target.value)} />
                    {fieldStatus.signupConfirmPassword === 'error' && <span className="field-msg err">Passwords must match</span>}
                  </div>

                  <button className="btn-main" onClick={doSignup}>
                    Create Account →
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="success-view">
              <h2>Welcome {successUser.name}</h2>
              <button className="btn-main" onClick={() => { setSuccessUser(null); onLogin(null) }}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`toast ${toast ? 'on' : ''}`}>{toast}</div>
    </div>
  )
}

export default Login
