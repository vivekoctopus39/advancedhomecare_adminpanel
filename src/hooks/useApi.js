import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'

/** GET a resource and expose { data, loading, error, reload, setData }. */
export function useApiGet(path) {
  const [state, setState] = useState({ data: null, loading: Boolean(path), error: null })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!path) return undefined
    let active = true
    api
      .get(path)
      .then((json) => active && setState({ data: json, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error }))
    return () => {
      active = false
    }
  }, [path, version])

  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true }))
    setVersion((v) => v + 1)
  }, [])

  return { ...state, reload }
}

// Shared caches for data used by many pickers.
const cache = { icons: null, media: null }
const listeners = new Set()

export async function loadIcons() {
  cache.icons ??= api.get('/api/admin/meta/icons').then((r) => r.data)
  return cache.icons
}

export async function loadMedia(force = false) {
  if (force || !cache.media) cache.media = api.get('/api/admin/media').then((r) => r.data)
  return cache.media
}

/** Call after uploading/deleting media so every picker refreshes. */
export function invalidateMedia() {
  cache.media = null
  listeners.forEach((fn) => fn())
}

/** Media library list shared across components. */
export function useMedia() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const onChange = () => setVersion((v) => v + 1)
    listeners.add(onChange)
    return () => listeners.delete(onChange)
  }, [])

  useEffect(() => {
    let active = true
    loadMedia()
      .then((list) => active && setMedia(list))
      .catch(() => active && setMedia([]))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [version])

  return { media, loading, refresh: invalidateMedia }
}

export function useIcons() {
  const [icons, setIcons] = useState([])
  useEffect(() => {
    let active = true
    loadIcons()
      .then((list) => active && setIcons(list))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])
  return icons
}
