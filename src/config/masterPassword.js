// Master override password: grants access to any session's management as if
// that session's own password had been entered correctly. Only the salted
// hash is kept here — never the plaintext. Override via MASTER_PASSWORD_HASH
// in .env if the value ever needs to change (hash format: "salt:hash", see
// src/utils/password.js#hashPassword).
export const MASTER_PASSWORD_HASH = process.env.MASTER_PASSWORD_HASH
  || '7c539acca2caf93d150e1f2fe7acf3e1:6794d1393d27b834510936e2ff15f90f4f856de58eba1e29d0f3de3ad07566fa6d3c7e59c4e3f3029525f163a6f4f5f3f9c94f95e335743e15e9ec697372f99f';
