import { Link } from 'react-router-dom'

type ArticleCardProps = {
  id: number
  title: string
  contents: string
  index: number
}

function ArticleCard({ id, title, contents, index }: ArticleCardProps) {
  const previewText = contents.replace(/\s+/g, ' ').trim()

  const preview = previewText.length > 190
    ? previewText.slice(0, 190).trimEnd() + '...'
    : previewText

  const wordCount = contents.trim().split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 225))

  return (
    <article className="story-card">
      <span className="story-index">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="story-card-content">
        <h3>
          <Link to={`/articles/${id}`}>{title}</Link>
        </h3>

        <p className="story-preview">{preview}</p>

        <div className="story-card-footer">
          <Link to={`/articles/${id}`} className="story-link">
            Read story
          </Link>
          <span className="reading-time">
            {readingTime} min read
          </span>
        </div>
      </div>
    </article>
  )
}

export default ArticleCard
