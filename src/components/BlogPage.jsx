import Blog from './Blog.jsx';
import SiteNav from './SiteNav.jsx';
import SiteFooter from './SiteFooter.jsx';

export default function BlogPage() {
  return (
    <div className="lovable-root min-h-screen bg-background flex flex-col">
      <SiteNav />
      <div className="pt-20 flex-1">
        <Blog />
      </div>
      <SiteFooter />
    </div>
  );
}
