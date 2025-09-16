import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Courses } from './components/Courses';
import { Advantages } from './components/Advantages';
import { Documents } from './components/Documents';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function App() {
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
    </div>
  );
}