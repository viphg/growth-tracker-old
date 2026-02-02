import { Plugin } from 'vite';

export default function pwaRegister(): Plugin {
  return {
    name: 'pwa-register',
    transformIndexHtml(html) {
      return html.replace(
        '</body>',
        `
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
              console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
              console.log('SW registration failed: ', registrationError);
            });
        });
      }
    </script>
    </body>`
      );
    },
  };
}