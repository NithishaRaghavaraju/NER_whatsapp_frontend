
import "./globals.css";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
         cz-shortcut-listen="true"
      >
        {children}
      </body>
    </html>
  );
}
