import { useEffect, useState } from 'react'
import axios from 'axios'

const API = import.meta.env.DEV ? 'http://localhost:5000' : import.meta.env.VITE_API_URL || ''

function SuggestionBox({ user }) {
  const [text, setText] = useState('')
  const [feed, setFeed] = useState([])
  const [replyDraft, setReplyDraft] = useState({})
  const [toast, setToast] = useState('')

  useEffect(() => {
    loadSuggestions()
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  const loadSuggestions = async () => {
    try {
      const response = await axios.get(`${API}/api/suggestions`)
      setFeed(response.data)
    } catch (error) {
      console.error('Unable to load suggestions', error)
      setToast('Unable to load suggestions')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return

    try {
      const response = await axios.post(`${API}/api/suggestions`, {
        text: text.trim(),
        author: user?.name || 'Guest',
        role: user?.role || 'student'
      })
      setFeed([response.data, ...feed])
      setText('')
      setToast('Suggestion sent')
    } catch (error) {
      console.error('Unable to send suggestion', error)
      setToast('Unable to send suggestion')
    }
  }

  const handleReply = async (id) => {
    const reply = (replyDraft[id] || '').trim()
    if (!reply) return

    try {
      const response = await axios.put(`${API}/api/suggestions/${id}/reply`, {
        reply,
        repliedBy: user?.name || 'Admin'
      })
      setFeed(feed.map((item) => (item._id === id ? response.data : item)))
      setReplyDraft((prev) => ({ ...prev, [id]: '' }))
      setToast('Reply submitted')
    } catch (error) {
      console.error('Unable to save reply', error)
      setToast('Unable to save reply')
    }
  }

  return (
    <div className="suggestion-page" style={{ marginTop: '32px' }}>
      <h2 style={{ color: '#4a381f', textAlign: 'center', marginBottom: '20px' }}>💡 Suggestion Box</h2>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        <form onSubmit={handleSubmit}>
          <textarea
            style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '10px', border: '1px solid #e7d3c6', marginBottom: '10px', fontFamily: 'inherit' }}
            placeholder="Share your idea or feedback"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            style={{ width: '100%', padding: '12px', backgroundColor: '#c66b34', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}
          >
            Submit Suggestion
          </button>
        </form>
      </div>

      {feed.map((item) => (
        <div key={item._id} className="suggestion-card" style={{ marginTop: '18px', backgroundColor: 'white', padding: '18px', borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
          <p style={{ margin: 0, color: '#3c2e23' }}>{item.text}</p>
          <small style={{ color: '#7f6a5b' }}>— {item.author} ({item.role})</small>

          {item.reply ? (
            <div style={{ marginTop: '14px', padding: '14px', backgroundColor: '#fff4e6', borderRadius: '10px', border: '1px solid #f3d0b8' }}>
              <strong>Admin Reply:</strong>
              <p style={{ margin: '8px 0 0', color: '#6a4d3e' }}>{item.reply}</p>
              {item.repliedBy && <small style={{ color: '#7f6a5b' }}>by {item.repliedBy}</small>}
            </div>
          ) : null}

          {user?.role === 'admin' && (
            <div className="reply-row" style={{ marginTop: '14px', width: '100%' }}>
              <input
                value={replyDraft[item._id] || ''}
                onChange={(e) => setReplyDraft((prev) => ({ ...prev, [item._id]: e.target.value }))}
                placeholder="Write a reply..."
                style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #e7d3c6' }}
              />
              <button
                type="button"
                onClick={() => handleReply(item._id)}
                style={{ padding: '12px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#c66b34', color: 'white', cursor: 'pointer', fontWeight: '700', whiteSpace: 'nowrap' }}
              >
                Send Reply
              </button>
            </div>
          )}
        </div>
      ))}

      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 10 }}>
        {toast && (
          <div style={{ backgroundColor: '#333', color: 'white', padding: '12px 18px', borderRadius: '999px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}

export default SuggestionBox
