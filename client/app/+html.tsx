import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Mingle — Authentic Expression, Zero Judgment</title>
        <ScrollViewStyleReset />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body style={{ backgroundColor: '#000000', margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
