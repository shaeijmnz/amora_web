import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import { getInitials } from '../lib/utils'
import { useToast } from '../context/ToastContext'
import { useNotifications } from '../context/NotificationContext'
import { api } from '../lib/api'

export default function Messages() {
  const toast = useToast()
  const { refresh: refreshBadge } = useNotifications()
  const [threads, setThreads] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [thread, setThread] = useState(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const scroller = useRef(null)

  const loadList = useCallback(async () => {
    const res = await api.messages()
    const rows = res.data || []
    setThreads(rows)
    setSelectedId((current) => current ?? rows[0]?.id ?? null)
    refreshBadge()
  }, [refreshBadge])

  const loadThread = useCallback(async (id) => {
    if (!id) {
      setThread(null)
      return
    }
    const res = await api.getMessageThread(id)
    setThread(res.data)
    refreshBadge()
  }, [refreshBadge])

  useEffect(() => {
    let cancelled = false
    loadList()
      .catch((e) => {
        if (!cancelled) toast.error(e.message || 'Could not load messages')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    const id = setInterval(() => {
      loadList().catch(() => {})
    }, 5000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [loadList, toast])

  useEffect(() => {
    if (!selectedId) return undefined
    loadThread(selectedId).catch((e) => toast.error(e.message || 'Could not open this chat'))
    const id = setInterval(() => {
      loadThread(selectedId).catch(() => {})
    }, 4000)
    return () => clearInterval(id)
  }, [selectedId, loadThread, toast])

  useEffect(() => {
    const node = scroller.current
    if (node) node.scrollTop = node.scrollHeight
  }, [thread?.messages?.length])

  async function sendReply(event) {
    event.preventDefault()
    const body = draft.trim()
    if (!body || !selectedId || sending) return
    setSending(true)
    try {
      const res = await api.replyToMessage(selectedId, body)
      setThread(res.data)
      setDraft('')
      loadList().catch(() => {})
    } catch (e) {
      toast.error(e.message || 'Could not send the reply')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">Chats from customers in the mobile app</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1rem', alignItems: 'stretch', minHeight: 520 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-header"><h3 className="card-title">Customers</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {!loading && threads.length === 0 && (
              <p className="text-sm text-muted" style={{ padding: '1rem 1.25rem' }}>
                No messages yet. When a customer writes from the app, the chat shows up here.
              </p>
            )}
            {threads.map((row) => {
              const active = row.id === selectedId
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelectedId(row.id)}
                  style={{
                    textAlign: 'left',
                    border: 'none',
                    borderBottom: '1px solid var(--color-border)',
                    background: active ? 'var(--color-blush)' : 'transparent',
                    padding: '0.9rem 1rem',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #e8a0ae, #c06070)',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.72rem', fontWeight: 700,
                    }}>
                      {getInitials(row.customer_name)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span className="font-semibold" style={{ fontSize: '0.86rem' }}>{row.customer_name}</span>
                        <span className="text-xs text-muted">{row.time}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className="text-xs text-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {row.preview}
                        </span>
                        {row.unread > 0 && <span className="nav-badge">{row.unread}</span>}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 520 }}>
          {!thread && (
            <div className="empty-state" style={{ margin: 'auto', padding: '3rem 1.5rem' }}>
              <div className="empty-state-icon"><MessageCircle size={40} /></div>
              <h3>{loading ? 'Loading chats…' : 'Select a customer'}</h3>
              <p>Replies you send here appear in the customer’s Messages tab.</p>
            </div>
          )}
          {thread && (
            <>
              <div className="card-header">
                <div>
                  <h3 className="card-title">{thread.customer_name}</h3>
                  <p className="text-xs text-muted" style={{ margin: 0 }}>{thread.customer_email}</p>
                </div>
              </div>
              <div ref={scroller} style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {(thread.messages || []).map((message) => (
                  <div key={message.id} style={{ display: 'flex', justifyContent: message.mine ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '75%',
                      background: message.mine ? 'var(--color-rose)' : 'var(--color-bg)',
                      color: message.mine ? '#fff' : 'var(--color-ink)',
                      borderRadius: message.mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '0.7rem 0.9rem',
                    }}>
                      <div style={{ fontSize: '0.9rem', lineHeight: 1.45 }}>{message.body}</div>
                      <div style={{ fontSize: '0.68rem', marginTop: 4, opacity: 0.75 }}>{message.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendReply} style={{ display: 'flex', gap: '0.5rem', padding: '0.9rem 1rem', borderTop: '1px solid var(--color-border)' }}>
                <input
                  className="form-input"
                  placeholder="Reply to this customer…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button className="btn btn-primary" type="submit" disabled={sending || !draft.trim()}>
                  <Send size={16} /> {sending ? 'Sending…' : 'Send'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
