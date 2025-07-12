

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


/**
 * Memvalidasi nomor WhatsApp Indonesia.
 * Mengizinkan format seperti 08..., +628..., 628... dan bisa mengandung spasi atau tanda hubung.
 * @param number Nomor WhatsApp yang akan divalidasi.
 * @returns `true` jika nomor valid, `false` jika tidak.
 */
export function validateWhatsapp(number: string): boolean {
    if (!number) return true; // Anggap valid jika opsional dan tidak diisi
    // Menghapus spasi dan tanda hubung, lalu memeriksa formatnya
    const cleanedNumber = number.replace(/[\s-]/g, '');
    const whatsappRegex = /^(?:\+?62|0)8[1-9][0-9]{7,12}$/;
    return whatsappRegex.test(cleanedNumber);
}
