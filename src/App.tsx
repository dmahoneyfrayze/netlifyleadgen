import { ThemeProvider } from '@/components/theme-provider';
import FrayzeStackBuilder from '@/components/frayze-stack-builder';

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="w-full min-h-screen">
        <FrayzeStackBuilder />
      </div>
    </ThemeProvider>
  );
}

export default App;