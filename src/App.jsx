import Header from './components/Header.jsx';
import Gallery from './components/Gallery.jsx';
import About from './components/About.jsx';
import Music from './components/Music.jsx';
import Footer from './components/Footer.jsx';
import News from './features/news/News.jsx';
import ChatWidget from './components/ChatWidget';

export default function App() {
  return (
    <>
      <Header />
      <Gallery />
      <About />
      <Music />
      <News />
      <Footer />
      <ChatWidget />
    </>
  );
}
