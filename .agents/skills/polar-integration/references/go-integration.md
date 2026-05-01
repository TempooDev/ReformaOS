# Polar Go Integration

Use the official `polar-go` SDK to manage products, checkouts, and subscriptions.

## Installation
```bash
go get github.com/polarsource/polar-go
```

## Basic Client Setup
```go
import (
    "context"
    polargo "github.com/polarsource/polar-go"
    "os"
)

func GetPolarClient() *polargo.Polar {
    return polargo.New(
        polargo.WithSecurity(os.Getenv("POLAR_ACCESS_TOKEN")),
        // Use polargo.WithServer("sandbox") for testing
    )
}
```

## Creating a Checkout
```go
func CreateCheckout(ctx context.Context, productId string) (*polargo.Checkout, error) {
    client := GetPolarClient()
    return client.Checkouts.Create(ctx, polargo.CheckoutCreate{
        ProductID: productId,
        SuccessURL: polargo.String("https://your-app.com/success?session_id={CHECKOUT_ID}"),
    })
}
```

## Listing Subscriptions
```go
func ListSubscriptions(ctx context.Context) {
    client := GetPolarClient()
    res, err := client.Subscriptions.List(ctx, polargo.SubscriptionListRequest{})
    // handle res.Result.Items
}
```
