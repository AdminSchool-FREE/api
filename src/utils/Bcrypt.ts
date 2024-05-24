import bcrypt from 'bcrypt';

export function criptografarSenha(senha: string) {
  return bcrypt.hashSync(senha, 8)
}

export async function validarSenhaCriptografada(
  senhaInformada: string,
  senhaSalva: string,
){
  return await bcrypt.compare(senhaInformada, senhaSalva)
}