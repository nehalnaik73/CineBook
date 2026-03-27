import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

// ⚠️  Change this to your machine's local IP when testing on a physical device
// e.g. 'http://192.168.1.10:5000'
// For Android emulator use: 'http://10.0.2.2:5000'
// For iOS simulator use:    'http://localhost:5000'
export const BASE_URL = 'http://192.168.1.10:5000'

const api = axios.create({ baseURL: `${BASE_URL}/api` })

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {}
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync('token')
      await SecureStore.deleteItemAsync('user')
    }
    return Promise.reject(err)
  }
)

export default api
