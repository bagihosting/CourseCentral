
/**
 * Memvalidasi kata sandi berdasarkan kriteria keamanan.
 * @param password Kata sandi yang akan divalidasi.
 * @returns `true` jika kata sandi valid, `false` jika tidak.
 */
export function validatePassword(password: string): boolean {
  // Minimal 8 karakter, mengandung setidaknya satu huruf besar, satu huruf kecil, satu angka, dan satu karakter khusus.
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return passwordRegex.test(password);
}
