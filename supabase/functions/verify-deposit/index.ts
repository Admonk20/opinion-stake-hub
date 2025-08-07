import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Constants
const TOKEN_ADDRESS = '0x1601C48F1178F1F9A9b0Be5f5bD7bb20CfD157F3'.toLowerCase()
const DECIMALS = 18
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // keccak256("Transfer(address,address,uint256)")

// Helpers
function addrToTopic(addr: string) {
  const a = addr.toLowerCase().replace('0x', '')
  return '0x' + '0'.repeat(24) + a
}

function hexToNumber(hex: string) {
  return parseInt(hex, 16)
}

function hexToBigInt(hex: string) {
  return BigInt(hex)
}

function formatUnits(value: bigint, decimals: number) {
  const divisor = BigInt(10) ** BigInt(decimals)
  const whole = value / divisor
  const frac = value % divisor
  if (frac === BigInt(0)) return whole.toString()
  const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '')
  return `${whole.toString()}.${fracStr}`
}

async function rpcCall(rpcUrl: string, method: string, params: any[]) {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message || 'RPC error')
  return json.result
}

export default async function handler(req: Request): Promise<Response> {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
  const BSC_RPC_URL = Deno.env.get('BSC_RPC_URL')
  const DEPOSIT_ADDRESS = Deno.env.get('DEPOSIT_ADDRESS')?.toLowerCase()

  if (!BSC_RPC_URL || !DEPOSIT_ADDRESS) {
    return new Response(JSON.stringify({ error: 'Missing BSC configuration' }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders },
    })
  }

  // Create authed Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: req.headers.get('Authorization') || '' },
    },
  })

  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user

  let body: any = {}
  try {
    if (req.method !== 'GET') body = await req.json()
  } catch (_) {}

  // Config endpoint
  if (body?.action === 'config' || req.method === 'GET') {
    return new Response(
      JSON.stringify({
        depositAddress: DEPOSIT_ADDRESS,
        tokenAddress: TOKEN_ADDRESS,
        decimals: DECIMALS,
      }),
      { status: 200, headers: { 'content-type': 'application/json', ...corsHeaders } }
    )
  }

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json', ...corsHeaders },
    })
  }

  const fromAddress: string = (body?.fromAddress || '').toLowerCase()
  const minAmount: number | undefined = body?.minAmount
  const lookbackBlocks: number = body?.lookbackBlocks ?? 100000 // ~3-4 days on BSC
  const minConfirmations: number = body?.minConfirmations ?? 5

  if (!fromAddress || !fromAddress.startsWith('0x') || fromAddress.length !== 42) {
    return new Response(JSON.stringify({ error: 'Invalid fromAddress' }), {
      status: 400,
      headers: { 'content-type': 'application/json', ...corsHeaders },
    })
  }

  try {
    // Get latest block
    const latestHex = await rpcCall(BSC_RPC_URL, 'eth_blockNumber', [])
    const latest = hexToNumber(latestHex)

    const fromBlock = Math.max(0, latest - lookbackBlocks)
    const toBlock = latest

    const logs = await rpcCall(BSC_RPC_URL, 'eth_getLogs', [
      {
        fromBlock: '0x' + fromBlock.toString(16),
        toBlock: '0x' + toBlock.toString(16),
        address: TOKEN_ADDRESS,
        topics: [
          TRANSFER_TOPIC,
          addrToTopic(fromAddress),
          addrToTopic(DEPOSIT_ADDRESS),
        ],
      },
    ])

    const eligibleLogs = (logs as any[]).filter((log) => {
      const confirms = latest - hexToNumber(log.blockNumber)
      return confirms >= minConfirmations
    })

    // Sum and map deposits
    let totalAmount = BigInt(0)
    const deposits = eligibleLogs.map((log) => {
      const value = hexToBigInt(log.data)
      totalAmount += value
      return {
        txHash: log.transactionHash,
        blockNumber: hexToNumber(log.blockNumber),
        valueRaw: value.toString(),
        value: formatUnits(value, DECIMALS),
      }
    })

    const totalFormatted = formatUnits(totalAmount, DECIMALS)
    const totalNumber = Number(totalFormatted)

    // Prevent double-credit by checking tx hashes already recorded
    const credited: string[] = []
    let newlyCredited = 0

    for (const d of deposits) {
      const { data: existing, error: checkErr } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .ilike('description', `%${d.txHash}%`)
        .limit(1)

      if (checkErr) console.warn('Check err', checkErr)
      if (!existing || existing.length === 0) {
        const amountNum = Number(d.value)
        const { error: txErr } = await supabase.from('transactions').insert({
          user_id: user.id,
          amount: amountNum,
          type: 'deposit',
          description: `On-chain deposit TZEE via BSC. Tx: ${d.txHash}`,
          status: 'completed',
        })
        if (!txErr) {
          // Upsert balance
          const { data: balanceRow } = await supabase
            .from('user_balances')
            .select('*')
            .eq('user_id', user.id)
            .single()

          const currentBalance = Number(balanceRow?.balance || 0)
          const currentDeposited = Number(balanceRow?.total_deposited || 0)

          const { error: balErr } = await supabase
            .from('user_balances')
            .upsert(
              {
                user_id: user.id,
                balance: currentBalance + amountNum,
                total_deposited: currentDeposited + amountNum,
              },
              { onConflict: 'user_id' }
            )
          if (balErr) console.error('Balance upsert error', balErr)

          credited.push(d.txHash)
          newlyCredited += amountNum
        }
      }
    }

    return new Response(
      JSON.stringify({
        fromAddress,
        depositAddress: DEPOSIT_ADDRESS,
        tokenAddress: TOKEN_ADDRESS,
        decimals: DECIMALS,
        totalFound: totalNumber,
        newlyCredited,
        matchedCount: deposits.length,
        creditedTxs: credited,
      }),
      { status: 200, headers: { 'content-type': 'application/json', ...corsHeaders } }
    )
  } catch (e: any) {
    console.error('verify-deposit error', e)
    return new Response(JSON.stringify({ error: e?.message || 'Verification failed' }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders },
    })
  }
}
