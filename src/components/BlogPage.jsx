import { Suspense, lazy } from 'react';

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
