import { NextResponse } from 'next/server'
import { agentService } from '@/services/agents'

export async function GET() {
    try {
        console.log('--- INVENTORY AGENT TEST ---')

        // Test 1: Predict stockout for a product
        const prediction = await agentService.inventory.predictStockout('SKU-TEST-001')
        console.log('Stockout Prediction:', prediction)

        // Test 2: Check stock levels
        const alert = await agentService.inventory.checkStockLevel('SKU-TEST-001')
        console.log('Stock Alert:', alert)

        // Test 3: Get pending alerts
        const pendingAlerts = await agentService.inventory.getPendingAlerts()
        console.log(`Pending Alerts: ${pendingAlerts.length}`)

        // Test 4: Analyze entire inventory
        const analysis = await agentService.inventory.analyzeInventory()
        console.log('Inventory Analysis:', analysis)

        return NextResponse.json({
            success: true,
            prediction,
            alert,
            pending_alerts_count: pendingAlerts.length,
            analysis
        })

    } catch (error: any) {
        console.error('Test Failed:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
