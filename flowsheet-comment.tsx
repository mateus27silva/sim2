'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, X, Edit2 } from 'lucide-react'

interface FlowsheetCommentProps {
  id: string
  x: number
  y: number
  text: string
  onUpdate: (id: string, text: string, x: number, y: number) => void
  onDelete: (id: string) => void
  isSelected?: boolean
  onSelect?: (id: string) => void
}

export function FlowsheetComment({ 
  id, 
  x, 
  y, 
  text, 
  onUpdate, 
  onDelete, 
  isSelected = false,
  onSelect 
}: FlowsheetCommentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(text)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const commentRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.detail === 2) { // Double click to edit
      setIsEditing(true)
      return
    }
    
    if (!isEditing) {
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - x,
        y: e.clientY - y
      })
      onSelect?.(id)
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && commentRef.current) {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      onUpdate(id, text, newX, newY)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleSave = () => {
    onUpdate(id, editText, x, y)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditText(text)
    setIsEditing(false)
  }

  useState(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  if (isEditing) {
    return (
      <div
        ref={commentRef}
        className="absolute z-20"
        style={{ left: x, top: y }}
      >
        <Card className="w-64 shadow-lg border-2 border-blue-500">
          <CardContent className="p-3">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Digite seu comentário..."
              className="mb-2 h-20 resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                Salvar
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      ref={commentRef}
      className={`absolute z-10 cursor-move select-none ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ left: x, top: y }}
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <Card className="w-48 shadow-md border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-colors">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                {text}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 hover:bg-red-100"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(id)
              }}
            >
              <X className="w-3 h-3 text-red-500" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}