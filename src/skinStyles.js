// Màu vẽ cho từng skin (id khớp với bảng skins ở backend)
export const SKIN_STYLES = {
  default: { body: '#facc15', wing: '#f59e0b' },
  blue: { body: '#38bdf8', wing: '#0284c7' },
  red: { body: '#ef4444', wing: '#b91c1c' },
  ninja: { body: '#334155', wing: '#0f172a', headband: '#ef4444' },
  golden: { body: '#fde047', wing: '#d97706', glow: '#fbbf24' },
}

export const getSkinStyle = (id) => SKIN_STYLES[id] || SKIN_STYLES.default
