import { useState, useEffect } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'

export default function Account({ session }) {
  const supabase = useSupabaseClient()
  const user = useUser()
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState(null)
  const [full_name, setFullName] = useState(null)
  const [avatar_url, setAvatarUrl] = useState(null)
  const [is_admin, setIsAdmin] = useState(false)

  useEffect(() => {
    getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`username, full_name, avatar_url, is_admin`)
        .eq('id', user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setFullName(data.full_name)
        setAvatarUrl(data.avatar_url)
        setIsAdmin(data.is_admin)
      }
    } catch (error) {
      alert('Error loading user data!')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({ username, full_name, avatar_url, is_admin }) {
    try {
      setLoading(true)

      const updates = {
        id: user.id,
        username,
        full_name,
        avatar_url,
        is_admin,
        updated_at: new Date().toISOString(),
      }

      let { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error
      alert('Profile updated!')
    } catch (error) {
      alert('Error updating the data!')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-widget">
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={session.user.email} disabled />
      </div>
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username || ''}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="full_name">Full Name</label>
        <input
          id="full_name"
          type="text"
          value={full_name || ''}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="is_admin">Is Admin?</label>
        <input
          id="is_admin"
          type="checkbox"
          value={is_admin}
          onChange={(e) => setIsAdmin(e.target.value)}
        />
      </div>

      <div>
        <button
          className="button primary block"
          onClick={() => updateProfile({ username, full_name, avatar_url, is_admin })}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div>
        <button className="button block" onClick={() => supabase.auth.signOut()}>
          Sign Out
        </button>
      </div>
    </div>
  )
}
