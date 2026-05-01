# Polar Webhooks

Webhooks notify your backend of events like successful payments, new subscriptions, or cancellations.

## Verification (Go)
Use standard hmac verification or the SDK's built-in helper if available.
```go
func HandleWebhook(w http.ResponseWriter, r *http.Request) {
    payload, _ := io.ReadAll(r.Body)
    signature := r.Header.Get("Webhook-Signature")
    
    // Verify using your Webhook Secret
    // if !VerifySignature(payload, signature, secret) { return }
    
    // Process Event
}
```

## Verification (.NET)
```csharp
[HttpPost("webhook")]
public async Task<IActionResult> PolarWebhook()
{
    var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
    var signature = Request.Headers["Webhook-Signature"];
    
    // Verify signature with HMAC SHA256 using your Webhook Secret
    
    return Ok();
}
```

## Key Events
- `order.created`: One-time purchase success.
- `subscription.created`: User subscribed.
- `subscription.updated`: Plan changed or status changed (e.g., active to past_due).
- `subscription.revoked`: Subscription ended.
- `benefit.granted`: A specific benefit (like GitHub access) was given.
