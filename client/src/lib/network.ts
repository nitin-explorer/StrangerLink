
const rawInternalURL = process.env.NEXT_PUBLIC_INTERNAL_URL;
const rawInternalPort = process.env.NEXT_PUBLIC_INTERNAL_PORT;
const rawServerURL = process.env.NEXT_PUBLIC_EXPRESS_URL;
const rawServerPort = process.env.NEXT_PUBLIC_EXPRESS_PORT;

if (!rawInternalURL) {
  throw new Error('NEXT_PUBLIC_INTERNAL_URL environment variable is not set');
}
if (!rawServerURL) {
  throw new Error('NEXT_PUBLIC_EXPRESS_URL environment variable is not set');
}

export const internalBaseURL = new URL(rawInternalURL)
if (rawInternalPort) internalBaseURL.port = rawInternalPort

export const serverBaseURL = new URL(rawServerURL)
if (rawServerPort) serverBaseURL.port = rawServerPort

