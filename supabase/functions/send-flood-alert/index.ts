import "@supabase/functions-js/edge-runtime.d.ts"

const FLOOD_THRESHOLD_CM = 100
const MOCK_TERMII_API_KEY = "TERMII_TEST_KEY_123"

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const record = payload.record as Record<string, unknown> | null | undefined

    if (!record || typeof record !== "object") {
      return new Response(JSON.stringify({ error: "Missing payload.record" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const water = Number(record.water_level_cm)
    if (!Number.isFinite(water) || water < FLOOD_THRESHOLD_CM) {
      return new Response("Water level normal. No alert required.", {
        status: 200,
      })
    }

    const termiiApiKey = Deno.env.get("TERMII_API_KEY")
    if (!termiiApiKey) {
      return new Response(JSON.stringify({ error: "Missing TERMII_API_KEY secret." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const from = Deno.env.get("TERMII_SENDER_ID") ?? "HydroSentry"
    const nodeId =
      typeof record.sensor_node_id === "string" ? record.sensor_node_id : "unknown"

    const smsBody =
      `CRITICAL ALERT: Flood threshold exceeded at sensor node ${nodeId}. Current depth: ${water}cm. Dispatch wardens to safe corridors immediately.`

    if (termiiApiKey === MOCK_TERMII_API_KEY) {
      const mockTo = Deno.env.get("TERMII_ALERT_PHONE") ?? "MOCK_DESTINATION"
      const simulatedPayload = {
        to: mockTo,
        from,
        sms: smsBody,
        type: "plain",
        channel: "dnd",
      }
      console.log(
        "[send-flood-alert] MOCK MODE — simulated Termii SMS payload (no HTTP):",
        JSON.stringify(simulatedPayload),
      )
      return new Response(
        JSON.stringify({
          success: true,
          mock: true,
          message: "SMS simulated; Termii API not called.",
          payload: simulatedPayload,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )
    }

    const to = Deno.env.get("TERMII_ALERT_PHONE")
    if (!to) {
      return new Response(
        JSON.stringify({
          error:
            "Configure TERMII_ALERT_PHONE for production sends (E.164-style MSISDN, no +).",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    const smsData = {
      to,
      from,
      sms: smsBody,
      type: "plain",
      channel: "dnd",
      api_key: termiiApiKey,
    }

    const response = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(smsData),
    })

    const raw = await response.text()
    let termiiResult: unknown
    try {
      termiiResult = raw ? JSON.parse(raw) : null
    } catch {
      termiiResult = raw
    }

    return new Response(JSON.stringify({ success: response.ok, termii: termiiResult }), {
      headers: { "Content-Type": "application/json" },
      status: response.ok ? 200 : 502,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ error: message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})
