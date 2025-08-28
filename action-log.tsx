'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw
} from 'lucide-react'

interface LogEntry {
  id: string
  type: 'ACTION' | 'WARNING' | 'ERROR' | 'EXECUTION'
  message: string
  details?: string
  timestamp: string
}

interface ActionLogProps {
  projectId?: string
  refreshTrigger?: number
}

export function ActionLog({ projectId, refreshTrigger }: ActionLogProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('limit', '20')
      if (projectId) params.append('projectId', projectId)

      const response = await fetch(`/api/simulation/logs?${params}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Logs recebidos:', data.logs) // Debug
        setLogs(data.logs)
      } else {
        console.error('Erro na resposta:', response.status)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    
    // Adicionar logs de teste para demonstração
    const addTestLogs = async () => {
      const testLogs = [
        { type: 'ACTION', message: 'Sistema de registro de ações inicializado', details: { component: 'ActionLog' } },
        { type: 'EXECUTION', message: 'Simulação de balanço de massa pronta', details: { status: 'ready' } },
        { type: 'WARNING', message: 'Verifique as conexões entre unidades', details: { check: 'connections' } }
      ]
      
      for (const log of testLogs) {
        try {
          await fetch('/api/simulation/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(log)
          })
        } catch (error) {
          console.error('Erro ao adicionar log de teste:', error)
        }
      }
    }
    
    // Adicionar logs de teste apenas na primeira montagem
    const timeoutId = setTimeout(addTestLogs, 1000)
    
    return () => clearTimeout(timeoutId)
  }, [projectId, refreshTrigger])

  const getIcon = (type: string) => {
    switch (type) {
      case 'ACTION':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'ERROR':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'EXECUTION':
        return <Activity className="w-4 h-4 text-blue-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'ACTION':
        return 'default'
      case 'WARNING':
        return 'secondary'
      case 'ERROR':
        return 'destructive'
      case 'EXECUTION':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ACTION':
        return 'Ação'
      case 'WARNING':
        return 'Aviso'
      case 'ERROR':
        return 'Erro'
      case 'EXECUTION':
        return 'Execução'
      default:
        return type
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Registro de Ações
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-32">
          <div className="space-y-2 p-4">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                {loading ? 'Carregando logs...' : 'Nenhum log encontrado'}
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getIcon(log.type)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getBadgeVariant(log.type) as any} className="text-xs">
                          {getTypeLabel(log.type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium mb-1 line-clamp-2">
                        {log.message}
                      </p>
                      
                      {log.details && (
                        <details className="text-xs text-muted-foreground">
                          <summary className="cursor-pointer hover:text-foreground">
                            Ver detalhes
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto max-h-20">
                            {JSON.stringify(JSON.parse(log.details), null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}