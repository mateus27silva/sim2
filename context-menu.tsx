'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Settings, Plus } from 'lucide-react'

interface ContextMenuProps {
  x: number
  y: number
  visible: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onAddComment?: () => void
  type: 'unit' | 'stream' | 'flowsheet'
}

export function ContextMenu({ 
  x, 
  y, 
  visible, 
  onClose, 
  onEdit, 
  onDelete, 
  onAddComment,
  type 
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyPress)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [visible, onClose])

  if (!visible) return null

  const getMenuItems = () => {
    switch (type) {
      case 'unit':
        return [
          { icon: Edit, label: 'Editar Unidade', action: onEdit },
          { icon: Plus, label: 'Adicionar Comentário', action: onAddComment || (() => {}) },
          { icon: Trash2, label: 'Excluir Unidade', action: onDelete, destructive: true }
        ]
      case 'stream':
        return [
          { icon: Edit, label: 'Editar Fluxo', action: onEdit },
          { icon: Trash2, label: 'Excluir Conexão', action: onDelete, destructive: true }
        ]
      case 'flowsheet':
        return [
          { icon: Plus, label: 'Adicionar Comentário', action: onAddComment || (() => {}) },
          { icon: Settings, label: 'Configurar Fluxograma', action: () => {} }
        ]
      default:
        return []
    }
  }

  const menuItems = getMenuItems()

  return (
    <div
      ref={menuRef}
      className="fixed z-50"
      style={{
        left: x,
        top: y,
        transform: 'translate(0, 0)'
      }}
    >
      <Card className="w-48 shadow-lg border">
        <CardContent className="p-1">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start h-8 px-2 text-sm"
              onClick={() => {
                item.action()
                onClose()
              }}
            >
              <item.icon className={`w-4 h-4 mr-2 ${item.destructive ? 'text-red-500' : ''}`} />
              <span className={item.destructive ? 'text-red-500' : ''}>{item.label}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}