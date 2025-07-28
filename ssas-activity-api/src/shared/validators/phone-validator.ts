// src/shared/validators/phone-validator.ts

/**
 * Valida el formato de número de teléfono con código de país
 * @param phone - Número de teléfono a validar (ej: +51987654321)
 * @returns true si el formato es válido
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  
  // Regex para validar: + seguido de 1-4 dígitos (código país) + 6-15 dígitos (número)
  const phoneRegex = /^\+\d{1,4}\d{6,15}$/;
  return phoneRegex.test(phone);
}

/**
 * Formatea un número de teléfono para mostrar
 * @param phone - Número de teléfono (ej: +51987654321)
 * @returns Número formateado para mostrar (ej: +51 987 654 321)
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  
  // Extraer código de país (+ y primeros 1-4 dígitos)
  const match = phone.match(/^(\+\d{1,4})(\d+)$/);
  if (!match) return phone;
  
  const [, countryCode, number] = match;
  
  // Formatear el número en grupos de 3 dígitos
  const formattedNumber = number.replace(/(\d{3})(?=\d)/g, '$1 ');
  
  return `${countryCode} ${formattedNumber}`;
}

/**
 * Lista de códigos de país comunes
 */
export const COUNTRY_CODES = [
  { code: '+51', country: 'Perú', flag: '🇵🇪' },
  { code: '+1', country: 'Estados Unidos/Canadá', flag: '🇺🇸' },
  { code: '+34', country: 'España', flag: '🇪🇸' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+52', country: 'México', flag: '🇲🇽' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
];
