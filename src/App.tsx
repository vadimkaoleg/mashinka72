import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Advantages } from './components/Advantages';
import { Documents } from './components/Documents';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Courses } from './components/Courses';
import { CookieBanner } from './components/CookieBanner';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { BlocksProvider } from './contexts/BlocksContext';
import { AdminPanel } from './components/AdminPanel';

function MainWebsite() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <About />
        <Courses />
        <Advantages />
        <Documents />
        <Contact />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}

function App() {
  return (
    <AccessibilityProvider>
      <BlocksProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainWebsite />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </BlocksProvider>
    </AccessibilityProvider>
  );
}

export { App };