// 专辑资料源：iTunes 搜索接口（免密钥、国内稳定、一次返回封面+曲目+艺人）
// 留了 MusicBrainz 做备用的空间，后面需要再扩展。

const ITUNES_SEARCH = 'https://itunes.apple.com/search'
const ITUNES_LOOKUP = 'https://itunes.apple.com/lookup'

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'music-club/0.1' } })
  if (!res.ok) throw new Error('音乐资料服务返回 ' + res.status)
  return res.json()
}

// 封面从 100x100 换到 600x600 高清版
function bigCover(url) {
  if (!url) return null
  return url.replace(/100x100bb/g, '600x600bb')
}

export async function searchAlbums(query) {
  const url = `${ITUNES_SEARCH}?term=${encodeURIComponent(query)}&entity=album&limit=20`
  const data = await fetchJson(url)
  return (data.results || []).map((r) => ({
    collectionId: String(r.collectionId),
    title: r.collectionName,
    artist: r.artistName,
    year: r.releaseDate ? r.releaseDate.slice(0, 4) : null,
    coverUrl: bigCover(r.artworkUrl100),
    trackCount: r.trackCount || null,
    genre: r.primaryGenreName || null
  }))
}

export async function getTracks(collectionId) {
  const url = `${ITUNES_LOOKUP}?id=${encodeURIComponent(collectionId)}&entity=song&limit=200`
  const data = await fetchJson(url)
  return (data.results || [])
    .filter((r) => r.wrapperType === 'track')
    .map((r) => ({
      number: r.trackNumber,
      title: r.trackName,
      durationMs: r.trackTimeMillis || null
    }))
}

export async function getAlbumGenre(collectionId) {
  const url = `${ITUNES_LOOKUP}?id=${encodeURIComponent(collectionId)}`
  const data = await fetchJson(url)
  const album = (data.results || []).find((r) => r.wrapperType === 'collection')
  return album ? album.primaryGenreName || null : null
}
