// Whitelist + clamp everything the client sends before it reaches the database.
export const SOCIAL_KEYS = ['linkedin', 'x', 'instagram', 'facebook', 'youtube', 'tiktok'];

const str = (v, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '');
const bool = (v) => v === true;
const num = (v, min, max, dflt) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : dflt;
};
const socials = (v) => {
  const out = {};
  if (v && typeof v === 'object') for (const k of SOCIAL_KEYS) if (typeof v[k] === 'string' && v[k].trim()) out[k] = v[k].slice(0, 500);
  return out;
};

export function cleanPerson(p = {}) {
  return {
    name: str(p.name),
    title: str(p.title),
    phone: str(p.phone, 40),
    email: str(p.email, 200),
    showEmail: bool(p.showEmail),
    includeCompanySocials: bool(p.includeCompanySocials),
    socials: socials(p.socials),
  };
}

export function cleanSettings(s = {}) {
  return {
    company: str(s.company),
    website: str(s.website, 500),
    logoUrl: str(s.logoUrl, 500),
    logoWidth: num(s.logoWidth, 40, 300, 160),
    logoHeight: num(s.logoHeight, 0, 400, 0),
    color: /^#[0-9a-f]{6}$/i.test(s.color) ? s.color : '#bc6045',
    socialStyle: s.socialStyle === 'icons' ? 'icons' : 'text',
    iconBase: str(s.iconBase, 500),
    companySocials: socials(s.companySocials),
    disclaimer: str(s.disclaimer, 1000),
  };
}

// What anyone holding a personal link may see: no email unless it's shown in the signature.
export function publicPerson(p) {
  const { email, ...rest } = p;
  return p.showEmail ? p : rest;
}
