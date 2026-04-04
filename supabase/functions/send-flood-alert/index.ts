import "@supabase/functions-js/edge-runtime.d.ts"

/** cm above which we send SMS (override with secret FLOOD_THRESHOLD_CM). */
const DEFAULT_FLOOD_THRESHOLD_CM = 100

Deno.serve(async (req) => {
  try {
    // Database webhook payload: { type, table, schema, record, old_record }
    const payload = await req.json()
    const record = payload.record as Record<string, unknown> | null | undefined

    if (!record || typeof record !== "object") {
      return new Response(JSON.stringify({ error: "Missing payload.record" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const water = Number(record.water_level_cm)
    const threshold = Number(
      Deno.env.get("FLOOD_THRESHOLD_CM") ?? DEFAULT_FLOOD_THRESHOLD_CM,
    )

    if (!Number.isFinite(water) || water < threshold) {
      return new Response("Water level normal. No alert required.", {
        status: 200,
      })
    }

    const termiiApiKey = Deno.env.get("TERMII_API_KEY")
    const to = Deno.env.get("TERMII_ALERT_PHONE")
    const from = Deno.env.get("TERMII_SENDER_ID") ?? "HydroSentry"

    if (!termiiApiKey || !to) {
      return new Response(
        JSON.stringify({
          error:
            "Configure secrets TERMII_API_KEY and TERMII_ALERT_PHONE (E.164-style MSISDN, no +).",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    const nodeId =
      typeof record.sensor_node_id === "string"
        ? record.sensor_node_id
        : "unknown"

    const smsData = {
      to,
      from,
      sms:
        `CRITICAL ALERT: Flood threshold exceeded at sensor node ${nodeId}. Current depth: ${water}cm. Dispatch wardens to safe corridors immediately.`,
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
