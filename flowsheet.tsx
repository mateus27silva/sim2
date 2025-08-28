'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Move, Link2, Unlink, Plus } from 'lucide-react'
import { ContextMenu } from './context-menu'
import { FlowsheetComment } from './flowsheet-comment'
import { StreamEditor } from './stream-editor'

interface UnitOperation {
  id: string
  type: string
  name: string
  x: number
  y: number
  inputs: string[]
  outputs: string[]
  parameters: Record<string, any>
}

interface Stream {
  id: string
  from: string
  to: string
  flowRate: number
  composition: Record<string, number>
  moisture: number
}

interface FlowsheetComment {
  id: string
  x: number
  y: number
  text: string
}

interface FlowsheetProps {
  selectedUnit: string | null
  setSelectedUnit: (unit: string | null) => void
  simulationData: any
  setSimulationData: (data: any) => void
  onUnitsChange?: (units: any[]) => void
  onStreamsChange?: (streams: any[]) => void
}

export function Flowsheet({ 
  selectedUnit, 
  setSelectedUnit, 
  simulationData, 
  setSimulationData,
  onUnitsChange,
  onStreamsChange
}: FlowsheetProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [units, setUnits] = useState<UnitOperation[]>([])
  const [streams, setStreams] = useState<Stream[]>([])
  const [comments, setComments] = useState<FlowsheetComment[]>([])
  const [draggingUnit, setDraggingUnit] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [connectingMode, setConnectingMode] = useState(false)
  const [selectedFromUnit, setSelectedFromUnit] = useState<string | null>(null)
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    type: 'unit' | 'stream' | 'flowsheet'
    targetId?: string
  }>({ visible: false, x: 0, y: 0, type: 'flowsheet' })
  
  // Stream editor state
  const [editingStream, setEditingStream] = useState<string | null>(null)
  
  // Selected comment state
  const [selectedComment, setSelectedComment] = useState<string | null>(null)

  const logAction = async (type: string, message: string, details?: any) => {
    console.log('Tentando criar log:', { type, message, details }) // Debug
    try {
      const response = await fetch('/api/simulation/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, details })
      })
      
      if (!response.ok) {
        console.error('Erro ao criar log:', response.status, response.statusText)
      } else {
        console.log('Log criado com sucesso')
      }
    } catch (error) {
      console.error('Error logging action:', error)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const unitType = e.dataTransfer.getData('text/plain')
    const rect = canvasRef.current?.getBoundingClientRect()
    
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const newUnit: UnitOperation = {
        id: `${unitType}-${Date.now()}`,
        type: unitType,
        name: getUnitName(unitType),
        x: x - 40,
        y: y - 30,
        inputs: [],
        outputs: [],
        parameters: getDefaultParameters(unitType)
      }
      
      setUnits(prev => {
        const newUnits = [...prev, newUnit]
        onUnitsChange?.(newUnits)
        return newUnits
      })
      
      // Log unit addition
      logAction('ACTION', `Unidade adicionada: ${newUnit.name}`, {
        unitId: newUnit.id,
        unitType: newUnit.type,
        position: { x, y }
      })
    }
  }, [onUnitsChange])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleUnitMouseDown = useCallback((e: React.MouseEvent, unitId: string) => {
    e.stopPropagation()
    
    if (e.button === 2) { // Right click
      e.preventDefault()
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        setContextMenu({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          type: 'unit',
          targetId: unitId
        })
      }
      return
    }
    
    if (connectingMode) {
      handleUnitConnection(unitId)
      return
    }
    
    setSelectedUnit(unitId)
    setSelectedComment(null)
    
    const unit = units.find(u => u.id === unitId)
    if (unit) {
      setDraggingUnit(unitId)
      setDragOffset({
        x: e.clientX - unit.x,
        y: e.clientY - unit.y
      })
    }
  }, [units, connectingMode])

  const handleUnitConnection = useCallback((toUnitId: string) => {
    if (!selectedFromUnit) {
      setSelectedFromUnit(toUnitId)
      return
    }
    
    if (selectedFromUnit === toUnitId) {
      setSelectedFromUnit(null)
      return
    }
    
    // Create stream connection
    const newStream: Stream = {
      id: `stream-${Date.now()}`,
      from: selectedFromUnit,
      to: toUnitId,
      flowRate: 100,
      composition: { Fe: 0.45, SiO2: 0.30, Al2O3: 0.15, Outros: 0.10 },
      moisture: 8.5
    }
    
    setStreams(prev => {
        const newStreams = [...prev, newStream]
        onStreamsChange?.(newStreams)
        return newStreams
      })
    
    // Update unit connections
    setUnits(prev => prev.map(unit => {
      if (unit.id === selectedFromUnit) {
        return { ...unit, outputs: [...unit.outputs, newStream.id] }
      }
      if (unit.id === toUnitId) {
        return { ...unit, inputs: [...unit.inputs, newStream.id] }
      }
      return unit
    }))
    
    // Log connection
    logAction('ACTION', `Conexão criada: ${selectedFromUnit} → ${toUnitId}`, {
      streamId: newStream.id,
      from: selectedFromUnit,
      to: toUnitId
    })
    
    setSelectedFromUnit(null)
    setConnectingMode(false)
  }, [selectedFromUnit, onStreamsChange])

  const deleteStream = useCallback((streamId: string) => {
    const stream = streams.find(s => s.id === streamId)
    if (!stream) return
    
    setStreams(prev => {
        const newStreams = prev.filter(s => s.id !== streamId)
        onStreamsChange?.(newStreams)
        return newStreams
      })
    
    // Update unit connections
    setUnits(prev => prev.map(unit => ({
      ...unit,
      inputs: unit.inputs.filter(id => id !== streamId),
      outputs: unit.outputs.filter(id => id !== streamId)
    })))
    
    // Log stream deletion
    logAction('ACTION', `Conexão removida: ${stream.from} → ${stream.to}`, {
      streamId: streamId
    })
  }, [streams, onStreamsChange])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggingUnit && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - dragOffset.x
      const y = e.clientY - rect.top - dragOffset.y
      
      setUnits(prev => prev.map(unit => 
        unit.id === draggingUnit 
          ? { ...unit, x: Math.max(0, x), y: Math.max(0, y) }
          : unit
      ))
    }
  }, [draggingUnit, dragOffset])

  const handleMouseUp = useCallback(() => {
    setDraggingUnit(null)
  }, [])

  const deleteUnit = useCallback((unitId: string) => {
    const unit = units.find(u => u.id === unitId)
    if (!unit) return
    
    // Remove connected streams
    const connectedStreams = streams.filter(s => s.from === unitId || s.to === unitId)
    connectedStreams.forEach(stream => deleteStream(stream.id))
    
    setUnits(prev => {
        const newUnits = prev.filter(unit => unit.id !== unitId)
        onUnitsChange?.(newUnits)
        return newUnits
      })
    
    if (selectedUnit === unitId) {
      setSelectedUnit(null)
    }
    
    // Log unit deletion
    logAction('ACTION', `Unidade removida: ${unit.name}`, {
      unitId: unitId,
      unitType: unit.type
    })
  }, [units, streams, selectedUnit, deleteStream, onUnitsChange])

  const handleCanvasRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        type: 'flowsheet'
      })
    }
  }, [])

  const handleStreamRightClick = useCallback((e: React.MouseEvent, streamId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'stream',
      targetId: streamId
    })
  }, [])

  const addComment = useCallback((x: number, y: number) => {
    const newComment: FlowsheetComment = {
      id: `comment-${Date.now()}`,
      x,
      y,
      text: 'Novo comentário'
    }
    setComments(prev => [...prev, newComment])
    setSelectedComment(newComment.id)
    logAction('ACTION', 'Comentário adicionado ao fluxograma', {
      commentId: newComment.id,
      position: { x, y }
    })
  }, [])

  const updateComment = useCallback((id: string, text: string, x: number, y: number) => {
    setComments(prev => prev.map(comment => 
      comment.id === id ? { ...comment, text, x, y } : comment
    ))
  }, [])

  const deleteComment = useCallback((id: string) => {
    setComments(prev => prev.filter(comment => comment.id !== id))
    if (selectedComment === id) {
      setSelectedComment(null)
    }
    logAction('ACTION', 'Comentário removido do fluxograma', { commentId: id })
  }, [selectedComment])

  const updateStream = useCallback((streamId: string, updates: Partial<{
    flowRate: number
    composition: Record<string, number>
    moisture: number
  }>) => {
    setStreams(prev => prev.map(stream => 
      stream.id === streamId ? { ...stream, ...updates } : stream
    ))
    logAction('ACTION', 'Fluxo atualizado', { streamId, updates })
  }, [])

  useEffect(() => {
    if (draggingUnit) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggingUnit, handleMouseMove, handleMouseUp])

  return (
    <div className="h-full relative">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button 
          variant={connectingMode ? "default" : "outline"} 
          size="sm"
          onClick={() => {
            setConnectingMode(!connectingMode)
            setSelectedFromUnit(null)
          }}
        >
          {connectingMode ? <Unlink className="w-4 h-4 mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
          {connectingMode ? 'Cancelar Conexão' : 'Conectar Unidades'}
        </Button>
        
        {connectingMode && selectedFromUnit && (
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
            Selecione a unidade de destino
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setUnits(prev => {
              const newUnits = []
              onUnitsChange?.(newUnits)
              return newUnits
            })
            setStreams(prev => {
              const newStreams = []
              onStreamsChange?.(newStreams)
              return newStreams
            })
            setSelectedUnit(null)
            setConnectingMode(false)
            setSelectedFromUnit(null)
            
            // Log clear action
            logAction('ACTION', 'Fluxograma limpo', {
              action: 'clear_flowsheet'
            })
          }}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Limpar
        </Button>
      </div>
      
      <div
        ref={canvasRef}
        className="w-full h-full bg-grid-slate-100 dark:bg-grid-slate-800"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onContextMenu={handleCanvasRightClick}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Stream connections */}
          {streams.map(stream => {
            const fromUnit = units.find(u => u.id === stream.from)
            const toUnit = units.find(u => u.id === stream.to)
            
            if (!fromUnit || !toUnit) return null
            
            return (
              <g key={stream.id}>
                <line
                  x1={fromUnit.x + 80}
                  y1={fromUnit.y + 30}
                  x2={toUnit.x}
                  y2={toUnit.y + 30}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-blue-500 hover:text-blue-600 cursor-pointer"
                  markerEnd="url(#arrowhead)"
                  onClick={() => setEditingStream(stream.id)}
                  onContextMenu={(e) => handleStreamRightClick(e, stream.id)}
                />
                <text
                  x={(fromUnit.x + 80 + toUnit.x) / 2}
                  y={(fromUnit.y + 30 + toUnit.y + 30) / 2 - 5}
                  className="text-xs fill-current text-blue-600 pointer-events-none"
                  textAnchor="middle"
                >
                  {stream.flowRate.toFixed(1)} t/h
                </text>
              </g>
            )
          })}
          
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                className="fill-blue-500"
              />
            </marker>
          </defs>
        </svg>
        
        {/* Comments */}
        {comments.map(comment => (
          <FlowsheetComment
            key={comment.id}
            id={comment.id}
            x={comment.x}
            y={comment.y}
            text={comment.text}
            onUpdate={updateComment}
            onDelete={deleteComment}
            isSelected={selectedComment === comment.id}
            onSelect={setSelectedComment}
          />
        ))}
        
        {/* Units */}
        {units.map(unit => (
          <Card
            key={unit.id}
            className={`absolute w-20 h-16 cursor-move select-none ${
              selectedUnit === unit.id 
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                : selectedFromUnit === unit.id
                ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950'
                : 'bg-white dark:bg-gray-800'
            } ${connectingMode ? 'cursor-crosshair' : ''}`}
            style={{
              left: unit.x,
              top: unit.y,
              transform: draggingUnit === unit.id ? 'scale(1.05)' : 'scale(1)',
              transition: draggingUnit === unit.id ? 'none' : 'all 0.2s',
              zIndex: selectedUnit === unit.id ? 10 : 1
            }}
            onMouseDown={(e) => handleUnitMouseDown(e, unit.id)}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const rect = canvasRef.current?.getBoundingClientRect()
              if (rect) {
                setContextMenu({
                  visible: true,
                  x: e.clientX,
                  y: e.clientY,
                  type: 'unit',
                  targetId: unit.id
                })
              }
            }}
          >
            <div className="flex flex-col items-center justify-center h-full p-2">
              <Move className="w-4 h-4 mb-1 text-muted-foreground" />
              <div className="text-xs font-medium text-center leading-tight">
                {unit.name}
              </div>
              <div className="text-[10px] text-muted-foreground text-center">
                {unit.inputs.length}→{unit.outputs.length}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Context Menu */}
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
        onEdit={() => {
          if (contextMenu.type === 'unit' && contextMenu.targetId) {
            setSelectedUnit(contextMenu.targetId)
          } else if (contextMenu.type === 'stream' && contextMenu.targetId) {
            setEditingStream(contextMenu.targetId)
          }
        }}
        onDelete={() => {
          if (contextMenu.type === 'unit' && contextMenu.targetId) {
            deleteUnit(contextMenu.targetId)
          } else if (contextMenu.type === 'stream' && contextMenu.targetId) {
            deleteStream(contextMenu.targetId)
          }
        }}
        onAddComment={() => {
          if (contextMenu.type === 'flowsheet') {
            addComment(contextMenu.x - 100, contextMenu.y - 50)
          } else if (contextMenu.type === 'unit' && contextMenu.targetId) {
            const unit = units.find(u => u.id === contextMenu.targetId)
            if (unit) {
              addComment(unit.x + 100, unit.y)
            }
          }
        }}
        type={contextMenu.type}
      />
      
      {/* Stream Editor */}
      {editingStream && (() => {
        const stream = streams.find(s => s.id === editingStream)
        const fromUnit = units.find(u => u.id === stream?.from)
        const toUnit = units.find(u => u.id === stream?.to)
        
        if (!stream || !fromUnit || !toUnit) return null
        
        return (
          <StreamEditor
            streamId={stream.id}
            fromX={fromUnit.x + 80}
            fromY={fromUnit.y + 30}
            toX={toUnit.x}
            toY={toUnit.y + 30}
            flowRate={stream.flowRate}
            composition={stream.composition}
            moisture={stream.moisture}
            onUpdate={updateStream}
            onDelete={deleteStream}
            onClose={() => setEditingStream(null)}
          />
        )
      })()}
    </div>
  )
}

function getUnitName(unitType: string): string {
  const names: Record<string, string> = {
    'jaw-crusher': 'Britador',
    'cone-crusher': 'Britador',
    'ball-mill': 'Moinho',
    'rod-mill': 'Moinho',
    'sag-mill': 'SAG',
    'vibrating-screen': 'Peneira',
    'hydrocyclone': 'Ciclone',
    'spiral-classifier': 'Classificador',
    'flotation-cell': 'Flotação',
    'jig': 'Jigue',
    'magnetic-separator': 'Sep. Mag.',
    'centrifuge': 'Centrífuga',
    'thickener': 'Espessador',
    'filter-press': 'Filtro',
    'vacuum-filter': 'Filtro',
    'dryer': 'Secador'
  }
  return names[unitType] || unitType
}

function getDefaultParameters(unitType: string): Record<string, any> {
  const defaults: Record<string, any> = {
    'jaw-crusher': { reductionRatio: 4, capacity: 100, efficiency: 0.85, power: 150 },
    'cone-crusher': { reductionRatio: 6, capacity: 150, efficiency: 0.88, power: 200 },
    'ball-mill': { diameter: 3, length: 4, speed: 20, efficiency: 0.90, power: 250 },
    'rod-mill': { diameter: 2.5, length: 3.5, speed: 15, efficiency: 0.85, power: 180 },
    'sag-mill': { diameter: 8, length: 4, speed: 10, efficiency: 0.92, power: 500 },
    'vibrating-screen': { aperture: 10, efficiency: 0.85, capacity: 200 },
    'hydrocyclone': { diameter: 0.5, pressure: 1.5, efficiency: 0.85 },
    'spiral-classifier': { pitch: 0.3, immersion: 0.5, efficiency: 0.80 },
    'flotation-cell': { volume: 10, airFlow: 5, recovery: 0.85, concentrateGrade: 0.65 },
    'jig': { stroke: 20, frequency: 60, efficiency: 0.75 },
    'magnetic-separator': { fieldStrength: 1.2, matrixType: 'steel', efficiency: 0.90 },
    'centrifuge': { speed: 3000, gForce: 2000, efficiency: 0.88 },
    'thickener': { diameter: 20, area: 314, efficiency: 0.95 },
    'filter-press': { area: 50, pressure: 8, efficiency: 0.90 },
    'vacuum-filter': { area: 30, vacuum: 0.6, efficiency: 0.85 },
    'dryer': { temperature: 150, capacity: 25, efficiency: 0.88 }
  }
  return defaults[unitType] || {}
}