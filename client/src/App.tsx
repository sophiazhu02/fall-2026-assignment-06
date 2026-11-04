import { Routes, Route } from 'react-router-dom'
import ArticleListPage from './pages/ArticleListPage'
import ArticleFormPage from './pages/ArticleFormPage'
import ArticleDetailPage from './pages/ArticleDetailPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ArticleListPage />} />
      <Route path="/articles/new" element={<ArticleFormPage />} />
      <Route path="/articles/:articleId/edit" element={<ArticleFormPage />} />
      <Route path="/articles/:articleId" element={<ArticleDetailPage />} />
    </Routes>
  )
}

export default App


