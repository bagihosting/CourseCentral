# === Tahap Builder ===
# Menggunakan image Node.js yang lebih besar untuk proses build
FROM node:20-alpine AS builder
WORKDIR /app

# Menyalin package.json dan package-lock.json
COPY package*.json ./

# Menginstal dependensi
RUN npm install

# Menyalin sisa kode aplikasi
COPY . .

# Menjalankan build Next.js
# Variabel lingkungan dummy mungkin diperlukan jika build Anda bergantung padanya
ARG GEMINI_API_KEY
RUN npm run build

# === Tahap Produksi ===
# Menggunakan image Node.js yang lebih kecil dan dioptimalkan untuk produksi
FROM node:20-alpine AS runner
WORKDIR /app

# Mengatur environment ke produksi
ENV NODE_ENV=production

# Menyalin folder .next yang sudah dioptimalkan dari tahap builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Memberi tahu Next.js di mana letak folder .next
# Ini tidak diperlukan jika struktur folder dipertahankan, tapi bagus untuk kejelasan
ENV NEXT_TELEMETRY_DISABLED 1

# Aplikasi akan berjalan di port 3000
EXPOSE 3000

# Pengguna non-root untuk keamanan
USER nextjs

# Perintah untuk menjalankan aplikasi
CMD ["node", "server.js"]
