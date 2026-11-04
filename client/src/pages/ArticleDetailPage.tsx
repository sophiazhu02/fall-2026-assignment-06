import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CommentsSection from '../components/CommentsSection'

type Article = {
  articleId: number
  title: string
  contents: string
}

function ArticleDetailPage() {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function fetchArticle() {
      setLoading(true)
      setError('')
      setArticle(null)

      try {
        const response = await fetch(
          `/api/articles/${articleId}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch story')
        }

        const data = await response.json()
        setArticle(data)
      } catch {
        if (!controller.signal.aborted) {
          setError('Unable to load this story.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    if (articleId) {
    fetchArticle()
    }

    return () => controller.abort()
  }, [articleId])

async function handleDelete() {
  if (!articleId || deleting) return

  const confirmed = window.confirm(
    'Are you sure you want to delete this story? Its comments will also be deleted.'
  )

  if (!confirmed) return

  setDeleting(true)
  setDeleteError('')

  try {
    const response = await fetch(`/api/articles/${articleId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete story')
    }

    navigate('/')
  } catch (error) {
    console.error('Delete error:', error)
    setDeleteError('Unable to delete story. Please try again.')
  } finally {
    setDeleting(false)
  }
}
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

      <main className="detail-page">
        <Link to="/" className="back-link">
          ← Back to archive
        </Link>

        {loading && <p>Loading story...</p>}
        {error && <p role="alert">{error}</p>}

        {!loading && !error && article && (
          <article>
            <header className="story-heading">
              <span className="eyebrow">SHORT FICTION</span>
              <h1>{article.title}</h1>
            </header>

            <div className="story-body">
              {article.contents}
            </div>
            <div className="article-actions">
            <Link to={`/articles/${articleId}/edit`} className="edit-button">
                Edit Story
            </Link>

            <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="delete-button"
            >
                {deleting ? 'Deleting...' : 'Delete Story'}
            </button>
            </div>

            {deleteError && (
            <p className="form-error" role="alert">
                {deleteError}
            </p>
            )}
            <CommentsSection articleId={article.articleId} />
          </article>
        )}
      </main>

      <footer className="site-footer">
        <p>Night Index · Independent horror fiction</p>
      </footer>
    </div>
  )
}

export default ArticleDetailPage
