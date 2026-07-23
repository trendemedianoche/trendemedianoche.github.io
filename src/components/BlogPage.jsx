import { Suspense, lazy } from 'react';

// El blog usa los estilos originales del sitio (no el tema Lovable)
import '../styles/base.css';
import '../styles/header.css';
import '../styles/footer.css';
import '../styles/blog.css';
import '../styles/responsive.css';

const Header = lazy(() => import('./Header.jsx'));
const BlogContent = lazy(() => import('./Blog.jsx'));
const Footer = lazy(() => import('./Footer.jsx'));
const ChatWidget = lazy(() => import('./ChatWidget.jsx'));

export default function BlogPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Header />
      <BlogContent />
      <Footer />
      <ChatWidget />
    </Suspense>
  );
}
