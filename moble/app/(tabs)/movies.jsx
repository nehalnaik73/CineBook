import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import api from '../api/axios'
import MovieCard from '../components/MovieCard'
import { Spinner, SectionTitle } from '../components/UI'
import { Colors, Radius } from '../theme'

export default function Movies() {
  const [movies, setMovies]    = useState([])
  const [genres, setGenres]    = useState([])
  const [languages, setLangs]  = useState([])
  const [loading, setLoading]  = useState(true)
  const [search, setSearch]    = useState('')
  const [genre, setGenre]      = useState('')
  const [language, setLang]    = useState('')
  const [page, setPage]        = useState(1)
  const [totalPages, setTotal] = useState(1)

  const fetchMovies = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 12 })
      if (search)   params.set('search',   search)
      if (genre)    params.set('genre',    genre)
      if (language) params.set('language', language)
      const { data } = await api.get(`/movies?${params}`)
      setMovies(data.movies)
      setTotal(data.totalPages)
    } finally { setLoading(false) }
  }, [page, search, genre, language])

  useEffect(() => { fetchMovies() }, [fetchMovies])
  useEffect(() => {
    api.get('/movies/genres').then(({ data }) => setGenres(data))
    api.get('/movies/languages').then(({ data }) => setLangs(data))
  }, [])

  const clearFilters = () => { setGenre(''); setLang(''); setSearch(''); setPage(1) }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search movies…"
          placeholderTextColor={Colors.muted}
          value={search}
          onChangeText={(t) => { setSearch(t); setPage(1) }}
        />
      </View>

      {/* Genre pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {genres.map((g) => (
          <TouchableOpacity key={g} onPress={() => { setGenre(g === genre ? '' : g); setPage(1) }}
            style={[styles.pill, genre === g && styles.pillActive]}>
            <Text style={[styles.pillText, genre === g && styles.pillTextActive]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Language pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {languages.map((l) => (
          <TouchableOpacity key={l} onPress={() => { setLang(l === language ? '' : l); setPage(1) }}
            style={[styles.pill, language === l && styles.pillActive]}>
            <Text style={[styles.pillText, language === l && styles.pillTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {(genre || language || search) && (
        <TouchableOpacity onPress={clearFilters} style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <Text style={{ color: Colors.red, fontSize: 12 }}>Clear all filters ×</Text>
        </TouchableOpacity>
      )}

      {/* Grid */}
      {loading ? <Spinner /> : movies.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 40, marginBottom: 10 }}>🎬</Text>
          <Text style={{ color: Colors.muted }}>No movies found.</Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(m) => String(m.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          renderItem={({ item }) => <MovieCard movie={item} />}
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={styles.pagination}>
                <TouchableOpacity disabled={page === 1} onPress={() => setPage(p => p - 1)}
                  style={[styles.pageBtn, page === 1 && { opacity: 0.3 }]}>
                  <Text style={styles.pageBtnText}>← Prev</Text>
                </TouchableOpacity>
                <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
                <TouchableOpacity disabled={page === totalPages} onPress={() => setPage(p => p + 1)}
                  style={[styles.pageBtn, page === totalPages && { opacity: 0.3 }]}>
                  <Text style={styles.pageBtnText}>Next →</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark, paddingTop: 12 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.input, borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: Radius.md, marginHorizontal: 16, marginBottom: 10, paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, color: Colors.white, paddingVertical: 10, fontSize: 14 },
  pillsRow: { marginBottom: 6 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full,
    backgroundColor: '#1f1f1f', borderWidth: 1, borderColor: Colors.cardBorder,
  },
  pillActive: { backgroundColor: Colors.red, borderColor: Colors.red },
  pillText: { color: Colors.muted, fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: Colors.white },
  row: { justifyContent: 'space-between' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, paddingVertical: 12 },
  pageBtn: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.md },
  pageBtnText: { color: Colors.white, fontWeight: '600', fontSize: 13 },
  pageInfo: { color: Colors.muted, fontSize: 13 },
})
