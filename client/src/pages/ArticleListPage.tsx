import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard'

type Article = {
  articleId: number
  title: string
  contents: string
}

function ArticleListPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function fetchArticles() {
      setLoading(true)
      setError('')

      try {
        const query = encodeURIComponent(search)
        const response = await fetch(
          `/api/articles?title_contains=${query}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error('Failed to load stories')
        }

        const data = await response.json()
        setArticles(data)
      } catch {
        if (!controller.signal.aborted) {
          setError('Unable to load stories.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchArticles()

    return () => controller.abort()
  }, [search])

  return (
    <div className="site-wrapper">
      <header className="site-header">
        <Link to="/" className="site-logo">
          NIGHT INDEX
        </Link>
        <nav>
          <Link to="/">Browse</Link>
          <Link to="/articles/new" className="submit-link">
            Submit a story
          </Link>
        </nav>
      </header>

      <main>
        <section className="intro">
          <span className="eyebrow">INDEPENDENT HORROR FICTION</span>
          <h1>The Archive</h1>
          <p>
            A collection of original short horror stories,
            written and shared by the community.
          </p>
        </section>

        <section className="archive">
          <div className="archive-heading">
            <h2>Browse stories</h2>
            <input
              type="search"
              placeholder="Search by title..."
              aria-label="Search stories by title"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {loading && <p>Loading stories...</p>}
          {error && <p role="alert">{error}</p>}

          {!loading && !error && articles.length === 0 && (
            <p className="empty-state">
              {search
                ? 'No stories match your search.'
                : 'No stories have been submitted yet.'}
            </p>
          )}

          {!loading && !error && (
            <div className="story-list">
              {articles.map((article, index) => (
                <ArticleCard
                  key={article.articleId}
                  id={article.articleId}
                  title={article.title}
                  contents={article.contents}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <p>Night Index · Independent horror fiction</p>
      </footer>
    </div>
  )
}

export default ArticleListPage
