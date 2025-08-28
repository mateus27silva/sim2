'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Square, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity,
  RefreshCw
} from 'lucide-react'

interface SimulationStatus {
  isRunning: boolean
  runningCount: number
  recentActivities: Array<{
    id: string
    type: string
    message: string
    timestamp: string
    details: any
  }>
}

interface SimulationProgressProps {
  onSimulationComplete?: (results: any) => void
}

export function SimulationProgress({ onSimulationComplete }: SimulationProgressProps) {
  const [status, setStatus] = useState<SimulationStatus | null>(null)
  const [currentSimulation, setCurrentSimulation] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/simulation/status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Error fetching simulation status:', error)
    }
  }

  const startSimulation = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/simulation/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      })
      
      const data = await response.json()
      if (data.simulationId) {
        // Start polling for updates
        pollSimulationStatus(data.simulationId)
      }
    } catch (error) {
      console.error('Error starting simulation:', error)
    } finally {
      setLoading(false)
    }
  }

  const stopSimulation = async () => {
    if (!currentSimulation) return
    
    try {
      await fetch('/api/simulation/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'stop', 
          simulationId: currentSimulation.simulationId 
        })
      })
      
      setCurrentSimulation(null)
    } catch (error) {
      console.error('Error stopping simulation:', error)
    }
  }

  const pollSimulationStatus = async (simulationId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/simulation/status?simulationId=${simulationId}`)
        const data = await response.json()
        
        setCurrentSimulation(data)
        
        if (data.status === 'completed') {
          if (onSimulationComplete) {
            onSimulationComplete(data.results)
          }
          return // Stop polling when completed
        }
        
        if (data.status === 'error') {
          return // Stop polling on error
        }
        
        // Continue polling
        setTimeout(poll, 1000)
      } catch (error) {
        console.error('Error polling simulation status:', error)
      }
    }
    
    poll()
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000) // Update every 5 seconds
    
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="default" className="bg-blue-500">Executando</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Concluído</Badge>
      case 'error':
        return <Badge variant="destructive">Erro</Badge>
      default:
        return <Badge variant="outline">Aguardando</Badge>
    }
  }

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime)
    const now = new Date()
    const diff = now.getTime() - start.getTime()
    
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Status da Simulação
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStatus}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
            {currentSimulation?.status === 'running' ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={stopSimulation}
              >
                <Square className="w-4 h-4 mr-2" />
                Parar
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={startSimulation}
                disabled={loading || currentSimulation?.status === 'running'}
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Simulation Status */}
        {currentSimulation && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(currentSimulation.status)}
                <span className="font-medium">
                  Simulação {currentSimulation.simulationId}
                </span>
                {getStatusBadge(currentSimulation.status)}
              </div>
              {currentSimulation.startTime && (
                <span className="text-sm text-muted-foreground">
                  {formatDuration(currentSimulation.startTime)}
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{currentSimulation.progress}%</span>
              </div>
              <Progress value={currentSimulation.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {currentSimulation.message}
              </p>
            </div>
            
            {currentSimulation.results && (
              <div className="mt-3 p-3 bg-muted rounded text-sm">
                <h4 className="font-medium mb-2">Resultados:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Unidades: {currentSimulation.results.summary.totalUnits}</div>
                  <div>Correntes: {currentSimulation.results.summary.totalStreams}</div>
                  <div>Tempo: {currentSimulation.results.summary.executionTime}ms</div>
                  <div>Erro: {currentSimulation.results.summary.massBalanceError}%</div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Overall Status */}
        {status && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span>Simulações ativas:</span>
              <Badge variant="outline">{status.runningCount}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>Status geral:</span>
              <Badge variant={status.isRunning ? "default" : "secondary"}>
                {status.isRunning ? 'Ocupado' : 'Disponível'}
              </Badge>
            </div>
          </div>
        )}
        
        {/* Recent Activities */}
        {status?.recentActivities && status.recentActivities.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Atividades Recentes</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {status.recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-2 text-xs">
                  {getStatusIcon(activity.type)}
                  <span className="flex-1 truncate">{activity.message}</span>
                  <span className="text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}