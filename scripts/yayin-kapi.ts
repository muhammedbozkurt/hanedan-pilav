// check-yayin.ts kapı kuralları; bayrak değerinden bağımsız sınanabilsin diye ayrı dosyada.
export function ipGorevHatasi(kuruldu: boolean): string | null {
  return kuruldu ? null : "Plesk zamanlanmış IP özeti temizlik görevi kurulmadı; README yayın bölümüne bakın.";
}
