module.exports = {
  semi: false, // Tidak menggunakan titik koma di akhir statement (clean style)
  singleQuote: true, // Gunakan single quote ('') daripada double quote ("")
  trailingComma: 'all', // Tambahkan trailing comma di object/array/function untuk diff git rapi
  printWidth: 100, // Maksimal panjang 1 baris 100 karakter agar tetap readable
  tabWidth: 2, // Gunakan 2 spasi untuk indentasi
  arrowParens: 'always', // Selalu gunakan tanda kurung pada parameter arrow function
  bracketSpacing: true, // Tambahkan spasi di dalam object literal { foo: bar }
  endOfLine: 'lf', // Gunakan line ending LF agar konsisten (hindari conflict Windows/Mac)
};
