import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

type Article = {
  articleId: number
  title: string
  contents: string
}

function ArticleFormPage() {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(articleId)

  const [title, setTitle] = useState('')
  const [contents, setContents] = useState('')
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!articleId) {
      return
    }

    const controller = new AbortController()

    async function loadArticle() {
      setLoading(true)
      setLoadError('')

      try {
        const response = await fetch(`/api/articles/${articleId}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Failed to load story')
        }

        const article: Article = await response.json()

        setTitle(article.title)
        setContents(article.contents)
      } catch {
        if (!controller.signal.aborted) {
          setLoadError('Unable to load this story for editing.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadArticle()

    return () => controller.abort()
  }, [articleId])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!title.trim() || !contents.trim()) {
      setError('Please enter a title and story.')
      return
    }

    setSaving(true)

    try {
      const url = isEditing
        ? `/api/articles/${articleId}`
        : '/api/articles'

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          contents: contents.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save story')
      }

      if (isEditing) {
        navigate(`/articles/${articleId}`)
      } else {
        const newArticle = await response.json()

        if (newArticle.articleId == null) {
          throw new Error('Missing article ID')
        }

        navigate(`/articles/${newArticle.articleId}`)
      }
    } catch (error) {
      console.error('Saving error:', error)
      setError('Unable to save story. Please try again.')
    } finally {
      setSaving(false)
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
        </nav>
      </header>

      <main className="form-page">
        <Link
          to={isEditing ? `/articles/${articleId}` : '/'}
          className="back-link"
        >
          ← Cancel
        </Link>

        <h1>{isEditing ? 'Edit Story' : 'Submit a Story'}</h1>

        <p className="page-description">
          {isEditing
            ? 'Make changes to your story below.'
            : 'Share an original work of short horror fiction.'}
        </p>

        {loading && <p>Loading story...</p>}

        {loadError && <p role="alert">{loadError}</p>}

        {!loading && !loadError && (
          <form onSubmit={handleSubmit} className="story-form">
            <div className="form-field">
              <label htmlFor="title">Story title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="contents">Your story</label>
              <textarea
                id="contents"
                value={contents}
                onChange={(event) => setContents(event.target.value)}
                rows={15}
              />
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button type="submit" disabled={saving}>
              {saving
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Publish Story'}
            </button>
          </form>
        )}
      </main>

      <footer className="site-footer">
        <p>Night Index · Independent horror fiction</p>
      </footer>
    </div>
  )
}

export default ArticleFormPage

