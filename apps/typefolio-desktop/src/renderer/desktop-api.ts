import { configureTypefolioApi } from "@typefolio/core/api";

let accessToken = "";
let apiBaseUrl = import.meta.env.VITE_TYPEFOLIO_API_URL || "http://127.0.0.1:43124";

function applyConfig(): void {
  configureTypefolioApi({
    baseUrl: apiBaseUrl,
    getAccessToken: () => accessToken || null,
    useCookies: false,
  });
}

export async function bootstrapDesktopApi(): Promise<{
  signedIn: boolean;
  email: string;
  apiBaseUrl: string;
}> {
  const session = await window.typefolioDesktop.getSession();
  accessToken = session.token;
  apiBaseUrl = session.apiBaseUrl || apiBaseUrl;
  applyConfig();
  return {
    signedIn: session.signedIn,
    email: session.email,
    apiBaseUrl,
  };
}

export function refreshApiToken(token: string, baseUrl: string): void {
  accessToken = token;
  apiBaseUrl = baseUrl || apiBaseUrl;
  applyConfig();
}

export async function loadFontFaceFromDesktop(
  libraryId: string,
  fontId: string,
  familyName: string,
): Promise<void> {
  const base64 = await window.typefolioDesktop.fetchFontBlobBase64(libraryId, fontId);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes]);
  const url = URL.createObjectURL(blob);
  const face = new FontFace(familyName, `url(${url})`);
  await face.load();
  document.fonts.add(face);
}
