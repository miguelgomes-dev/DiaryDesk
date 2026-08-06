import { DateTime } from "luxon";

// O app é de uso pessoal para duas pessoas no Brasil — um único fuso fixo
// é a modelagem certa (ver docs/project-scope.md). Todo instante gravado
// no banco (timestamptz) passa por aqui na escrita e na leitura, para que
// o resto do código (formulário, calendário, recorrência) só manipule
// strings de hora local "ingênuas" (sem fuso), nunca `new Date()` cru.
export const APP_TIMEZONE = "America/Sao_Paulo";

/**
 * Converte data + hora de parede (como digitadas no formulário, sempre
 * entendidas como horário de Brasília) no instante UTC correspondente,
 * pronto para gravar numa coluna timestamptz.
 */
export function zonedWallClockToUtcIso(date: string, time: string): string {
  return (
    DateTime.fromISO(`${date}T${time}:00`, { zone: APP_TIMEZONE })
      .toUTC()
      .toISO({ suppressMilliseconds: true }) ?? new Date().toISOString()
  );
}

/**
 * Converte um timestamptz vindo do Supabase (instante UTC) na hora de
 * parede correspondente em APP_TIMEZONE, como string "ingênua"
 * (sem 'Z'/offset). Componentes client-side então só precisam fatiar a
 * string — nunca usam `new Date()`, então o fuso do navegador de quem
 * está vendo a tela não entra na conta.
 */
export function utcIsoToZonedIso(iso: string): string {
  return DateTime.fromISO(iso)
    .setZone(APP_TIMEZONE)
    .toFormat("yyyy-MM-dd'T'HH:mm:00");
}
