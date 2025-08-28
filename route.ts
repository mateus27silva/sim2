import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const where = projectId ? { projectId } : {}
    
    const logs = await db.simulationLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset
    })
    
    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json({ error: 'Erro ao buscar logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, message, details, projectId } = await request.json()
    
    const log = await db.simulationLog.create({
      data: {
        type,
        message,
        details: details ? JSON.stringify(details) : null,
        projectId
      }
    })
    
    return NextResponse.json({ log, message: 'Log criado com sucesso' })
  } catch (error) {
    console.error('Error creating log:', error)
    return NextResponse.json({ error: 'Erro ao criar log' }, { status: 500 })
  }
}