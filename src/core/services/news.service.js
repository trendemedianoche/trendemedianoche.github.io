import news from '../../data/news.json';

export const NewsService = {
  getAll() {
    return Promise.resolve(news);
  }
};