/**
 * Lazy loader for the playwright-core browser engines.
 *
 * playwright-core (the driver, ~10MB, no browser download) is a regular
 * dependency, so the import resolves on a plain install without pulling the
 * ~150MB browser binaries onto every consumer — library-only importers
 * (drift, types, normalize, dtcg) and Vercel/CI installs stay lean. The actual
 * browser binary is fetched on demand, by `dembrandt install-browser` or by the
 * first extraction that finds it missing, so only callers that really extract
 * pay for it. Never by a bare `npx playwright install`: playwright-core is
 * pinned to an exact version, and npx installs whatever revision the registry
 * serves today, which the pinned driver then cannot find.
 * The import is still routed through here and guarded so a missing engine
 * surfaces a clear instruction; dynamic `import()` defers resolution to use.
 */

export class PlaywrightMissingError extends Error {
  /**
   * Names the engine in the recovery command. `install-browser` defaults to
   * chromium, so a bare hint sends a `--browser firefox` user to a command that
   * reinstalls chromium and leaves them on the identical error.
   */
  constructor(engine = 'chromium') {
    super(`browser engine not available, run: dembrandt install-browser ${engine}`);
    this.name = 'PlaywrightMissingError';
  }
}

/**
 * True when Playwright is reporting a missing browser *binary*, not a missing
 * module. The two failures read alike to a user and need opposite fixes: this
 * one is recoverable without them doing anything.
 *
 * Matched on Playwright's own message because it exposes no error code for it.
 */
export function isMissingBrowserBinary(err: unknown): boolean {
  const message = (err as { message?: string } | null)?.message ?? '';
  return /Executable doesn't exist/i.test(message);
}

export async function loadBrowserEngines(): Promise<typeof import('playwright-core')> {
  try {
    return await import('playwright-core');
  } catch {
    throw new PlaywrightMissingError();
  }
}
