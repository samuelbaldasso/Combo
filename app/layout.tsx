import type React from "react"
export const metadata = {
  title: "Localizador de Comércios",
  description: "Encontre comércios próximos à sua localização",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.ENV = {
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "${process.env.GOOGLE_MAPS_API_KEY}"
              };
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}



import './globals.css'