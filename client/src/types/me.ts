/** Matches API `MeResponseDto` JSON (camelCase). */
export type MeResponse = {
  sub: string
  sessionId: string | null
  issuer: string | null
}
