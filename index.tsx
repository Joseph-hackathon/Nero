
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PrivyProvider } from './PrivyContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || "cmjwevmi40382ih0bcxl3nqoz"}
      config={{
        loginMethods: ['email', 'wallet', 'google'],
        appearance: {
          theme: 'light',
          accentColor: '#4F46E5',
          logo: 'https://raw.githubusercontent.com/ant-design/ant-design-icons/master/packages/icons-svg/svg/filled/robot.svg'
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          noPromptOnSignature: true
        },
        externalWallets: {
          coinbaseWallet: {
            connectionOptions: 'smartWalletOnly',
          },
          // Privy automatically detects installed wallets
          // Nightly wallet will appear if installed in the browser
        },
        // Privy automatically detects installed browser extension wallets
        // When user clicks "Connect Wallet", all installed wallets including Nightly will be shown
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
);
