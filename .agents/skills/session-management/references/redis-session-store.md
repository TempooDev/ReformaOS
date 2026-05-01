# Redis Session Store

This reference explains how to implement a shared session store using Redis in this multi-stack environment.

## Data Structure
Sessions are stored as strings or JSON in Redis with a TTL.
Key pattern: `session:{token}`
Value: `{ "userId": "...", "claims": [...], "expires": "..." }`

## Go Implementation (`go-redis/v9`)
```go
import (
    "context"
    "encoding/json"
    "github.com/redis/go-redis/v9"
)

type Session struct {
    UserID string   `json:"user_id"`
    Claims []string `json:"claims"`
}

func SaveSession(ctx context.Context, rdb *redis.Client, token string, session Session) error {
    data, _ := json.Marshal(session)
    return rdb.Set(ctx, "session:"+token, data, time.Hour*24).Err()
}

func GetSession(ctx context.Context, rdb *redis.Client, token string) (*Session, error) {
    val, err := rdb.Get(ctx, "session:"+token).Result()
    if err != nil { return nil, err }
    
    var session Session
    json.Unmarshal([]byte(val), &session)
    return &session, nil
}
```

## .NET Implementation (`Aspire.StackExchange.Redis`)
```csharp
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

public class SessionService(IDistributedCache cache)
{
    public async Task SaveSessionAsync(string token, UserSession session)
    {
        var data = JsonSerializer.SerializeToUtf8Bytes(session);
        await cache.SetAsync($"session:{token}", data, new DistributedCacheEntryOptions {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
        });
    }

    public async Task<UserSession?> GetSessionAsync(string token)
    {
        var data = await cache.GetAsync($"session:{token}");
        return data == null ? null : JsonSerializer.Deserialize<UserSession>(data);
    }
}
```
