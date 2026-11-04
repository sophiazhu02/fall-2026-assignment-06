import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

type Comment = {
  commentId: number
  articleId: number
  body: string
}

type CommentsSectionProps = {
  articleId: number
}

function CommentsSection({ articleId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [formError, setFormError] = useState('')

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editBody, setEditBody] = useState('')
  const [editError, setEditError] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  // Deleting state
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState('')

  // Fetch comments when the article loads
  useEffect(() => {
    const controller = new AbortController()

    async function fetchComments() {
      setLoading(true)
      setLoadError('')

      try {
        const response = await fetch(
          `/api/articles/${articleId}/comments`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error('Failed to load comments')
        }

        const data: Comment[] = await response.json()
        setComments(data)
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Comments error:', error)
          setLoadError('Unable to load comments.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchComments()

    return () => controller.abort()
  }, [articleId])

  // Add a new comment
  async function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    if (!body.trim()) {
      setFormError('Please enter a comment.')
      return
    }

    if (adding) return
    setAdding(true)

    try {
      const response = await fetch(
        `/api/articles/${articleId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ body: body.trim() }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      const newComment: Comment = await response.json()

      setComments((current) => [...current, newComment])
      setBody('')
    } catch (error) {
      console.error('Add comment error:', error)
      setFormError('Unable to post comment.')
    } finally {
      setAdding(false)
    }
  }

  // Open the inline edit form
  function startEditing(comment: Comment) {
    setEditingId(comment.commentId)
    setEditBody(comment.body)
    setEditError('')
  }

  // Cancel editing
  function cancelEditing() {
    setEditingId(null)
    setEditBody('')
    setEditError('')
  }

  // Save an edited comment
  async function handleSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEditError('')

    if (!editBody.trim()) {
      setEditError('Comment cannot be empty.')
      return
    }

    if (editingId === null || savingEdit) return

    setSavingEdit(true)

    try {
      const response = await fetch(
        `/api/articles/${articleId}/comments/${editingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ body: editBody.trim() }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update comment')
      }

      setComments((current) =>
        current.map((comment) =>
          comment.commentId === editingId
            ? { ...comment, body: editBody.trim() }
            : comment
        )
      )

      cancelEditing()
    } catch (error) {
      console.error('Edit comment error:', error)
      setEditError('Unable to save changes.')
    } finally {
      setSavingEdit(false)
    }
  }

  // Delete a comment
  async function handleDeleteComment(commentId: number) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this comment?'
    )

    if (!confirmed) return

    setDeletingId(commentId)
    setDeleteError('')

    try {
      const response = await fetch(
        `/api/articles/${articleId}/comments/${commentId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Failed to delete comment')
      }

      setComments((current) =>
        current.filter((comment) => comment.commentId !== commentId)
      )
    } catch (error) {
      console.error('Delete comment error:', error)
      setDeleteError('Unable to delete comment.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="comments-section">
      <h2>Comments</h2>

      {loading && <p>Loading comments...</p>}
      {loadError && <p role="alert">{loadError}</p>}

      {!loading && !loadError && (
        <>
          {comments.length === 0 ? (
            <p className="empty-state">No comments yet.</p>
          ) : (
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.commentId} className="comment">

                  {editingId === comment.commentId ? (
                    <form
                      onSubmit={handleSaveEdit}
                      className="comment-edit-form"
                    >
                      <textarea
                        aria-label="Edit comment"
                        value={editBody}
                        onChange={(event) =>
                          setEditBody(event.target.value)
                        }
                        rows={4}
                      />

                      {editError && (
                        <p className="form-error" role="alert">
                          {editError}
                        </p>
                      )}

                      <div className="comment-actions">
                        <button type="submit" disabled={savingEdit}>
                          {savingEdit ? 'Saving...' : 'Save Changes'}
                        </button>

                        <button
                          type="button"
                          className="cancel-button"
                          onClick={cancelEditing}
                          disabled={savingEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p>{comment.body}</p>

                      <div className="comment-actions">
                        <button
                          type="button"
                          onClick={() => startEditing(comment)}
                          disabled={editingId !== null}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="cancel-button"
                          onClick={() =>
                            handleDeleteComment(comment.commentId)
                          }
                          disabled={deletingId !== null}
                        >
                          {deletingId === comment.commentId
                            ? 'Deleting...'
                            : 'Delete'}
                        </button>
                      </div>
                    </>
                  )}

                </div>
              ))}
            </div>
          )}

          {deleteError && (
            <p className="form-error" role="alert">{deleteError}</p>
          )}

          <form onSubmit={handleAddComment} className="comment-form">
            <label htmlFor="comment-body">Leave a comment</label>

            <textarea
              id="comment-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Share your thoughts on this story..."
              rows={4}
            />

            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}

            <button type="submit" disabled={adding}>
              {adding ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        </>
      )}
    </section>
  )
}

export default CommentsSection

