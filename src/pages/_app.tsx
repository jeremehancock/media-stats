import type { AppProps } from 'next/app';
import { CssBaseline } from '@mui/material';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Media Stats</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta name="description" content="Simple Plex Media Stats" />
        <link
          rel="icon"
          type="image/png"
          href="/icons/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/icons/favicon.svg" />
        <link rel="shortcut icon" href="/icons/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="MediaStats" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <CssBaseline />
      <Component {...pageProps} />
    </>
  );
}
