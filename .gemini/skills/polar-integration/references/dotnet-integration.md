# Polar .NET Integration

Since there is no official .NET SDK, use `HttpClient` to interact with the Polar API.

## Configuration
Add your Polar tokens to `appsettings.json` or Environment Variables.
```json
{
  "Polar": {
    "AccessToken": "your_token",
    "ApiUrl": "https://sandbox-api.polar.sh/v1"
  }
}
```

## Service Example
```csharp
public class PolarService
{
    private readonly HttpClient _httpClient;
    private readonly string _accessToken;

    public PolarService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _accessToken = config["Polar:AccessToken"];
        _httpClient.BaseAddress = new Uri(config["Polar:ApiUrl"]);
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
    }

    public async Task<string> CreateCheckoutAsync(string productId)
    {
        var response = await _httpClient.PostAsJsonAsync("checkouts", new {
            product_id = productId,
            success_url = "https://your-app.com/success"
        });
        
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<CheckoutResponse>();
        return result.Url;
    }
}
```
