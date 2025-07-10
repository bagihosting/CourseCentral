# Tahap 1: Instalasi Dependensi
# Menggunakan image Node.js versi 20-alpine yang ringan sebagai dasar.
FROM node:20-alpine AS deps
WORKDIR /app

# Salin package.json dan package-lock.json (jika ada) untuk menginstal dependensi.
COPY package.json ./
# Pastikan npm tahu kita berada di lingkungan CI untuk menghindari prompt interaktif.
RUN npm config set --global `npm_config_ci` true
RUN npm install

# -----------------------------------------------------------------------------------

# Tahap 2: Pembangunan Aplikasi
# Membangun aplikasi menggunakan dependensi yang sudah diinstal dari tahap sebelumnya.
FROM node:20-alpine AS builder
WORKDIR /app

# Salin node_modules dari tahap 'deps'.
COPY --from=deps /app/node_modules ./node_modules
# Salin sisa kode aplikasi.
COPY . .

# Build aplikasi Next.js untuk produksi.
# Environment variable ini memastikan build dioptimalkan untuk produksi.
ENV NODE_ENV production
RUN npm run build

# -----------------------------------------------------------------------------------

# Tahap 3: Produksi (Runner)
# Ini adalah image final yang akan dijalankan, ukurannya sangat kecil dan aman.
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Salin file konfigurasi Next.js yang diperlukan.
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public

# Salin output 'standalone' yang efisien dari tahap builder.
# Ini berisi semua yang dibutuhkan untuk menjalankan aplikasi, tanpa kode sumber.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Jalankan aplikasi menggunakan pengguna 'nextjs' yang tidak memiliki hak root (lebih aman).
USER nextjs

EXPOSE 3000

# Perintah untuk menjalankan server Next.js.
CMD ["node", "server.js"]
