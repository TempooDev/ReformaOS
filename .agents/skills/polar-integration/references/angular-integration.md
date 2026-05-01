# Polar Angular Integration

Use the `@polar-sh/sdk` for frontend interactions.

## Installation
```bash
npm install @polar-sh/sdk
```

## Angular Service
```typescript
import { Injectable } from '@angular/core';
import { Polar } from '@polar-sh/sdk';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PolarService {
  private polar = new Polar({
    accessToken: environment.polarAccessToken,
    server: environment.production ? 'production' : 'sandbox'
  });

  async getProducts() {
    return await this.polar.products.list({});
  }

  async getCheckouts() {
    return await this.polar.checkouts.list({});
  }
}
```

## Polar JS Script (Embedded Checkout)
You can add this to your `index.html` to enable the embedded checkout overlay:
```html
<script src="https://get.polar.sh/checkout.js" defer></script>
```

Then trigger it with a simple link:
```html
<a href="https://buy.polar.sh/..." data-polar-checkout>Buy Now</a>
```
