# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: health.spec.js >> Health Management >> should show cart count
- Location: tests\health.spec.js:19:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.medical-cart-trigger')
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.medical-cart-trigger')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e5]:
      - link "Student Living Logo StudentLiving" [ref=e6] [cursor=pointer]:
        - /url: /
        - img "Student Living Logo" [ref=e7]
        - generic [ref=e8]: StudentLiving
      - list [ref=e10]:
        - listitem [ref=e11]:
          - link "Home" [ref=e12] [cursor=pointer]:
            - /url: /
        - listitem [ref=e13]:
          - button "🧺 Laundry" [ref=e14] [cursor=pointer]:
            - text: 🧺 Laundry
            - img [ref=e15]
        - listitem [ref=e17]:
          - link "Hostel" [ref=e18] [cursor=pointer]:
            - /url: /hostel
        - listitem [ref=e19]:
          - button "🏥 Medical Panel" [ref=e20] [cursor=pointer]:
            - text: 🏥 Medical Panel
            - img [ref=e21]
        - listitem [ref=e23]:
          - button "🍔 Food" [ref=e24] [cursor=pointer]:
            - text: 🍔 Food
            - img [ref=e25]
      - generic [ref=e27]:
        - button "Toggle Theme" [ref=e28] [cursor=pointer]:
          - img [ref=e29]
        - link "Login" [ref=e35] [cursor=pointer]:
          - /url: /login
        - link "Get Started" [ref=e36] [cursor=pointer]:
          - /url: /register
    - list [ref=e39]:
      - listitem [ref=e40]:
        - button "🧺 Laundry" [ref=e41] [cursor=pointer]:
          - text: 🧺 Laundry
          - img [ref=e42]
        - generic:
          - link "🧺 Laundry Services" [ref=e44] [cursor=pointer]:
            - /url: /laundry
          - link "🎫 My Laundry Bookings" [ref=e45] [cursor=pointer]:
            - /url: /my-bookings
      - listitem [ref=e46]:
        - link "Hostel & Boarding" [ref=e47] [cursor=pointer]:
          - /url: /hostel
      - listitem [ref=e48]:
        - button "🏥 Medical Panel" [ref=e49] [cursor=pointer]:
          - text: 🏥 Medical Panel
          - img [ref=e50]
        - generic:
          - link "💊 Medical Panel" [ref=e52] [cursor=pointer]:
            - /url: /health/medical-panel
          - link "📅 Book Appointment" [ref=e53] [cursor=pointer]:
            - /url: /health/appointment-booking
          - link "My Appointments" [ref=e54] [cursor=pointer]:
            - /url: /health/my-appointments
          - link "📋 Prescriptions" [ref=e55] [cursor=pointer]:
            - /url: /health/prescriptions
      - listitem [ref=e56]:
        - button "🍔 Food Hub" [ref=e57] [cursor=pointer]:
          - text: 🍔 Food Hub
          - img [ref=e58]
        - generic:
          - link "🍔 Food Hub" [ref=e60] [cursor=pointer]:
            - /url: /food
          - link "📦 My Orders" [ref=e61] [cursor=pointer]:
            - /url: /food/my-orders
          - link "🍽️ My Meal Plans" [ref=e62] [cursor=pointer]:
            - /url: /food/my-plans
      - listitem [ref=e63]:
        - link "Login" [ref=e64] [cursor=pointer]:
          - /url: /login
      - listitem [ref=e65]:
        - link "Get Started" [ref=e66] [cursor=pointer]:
          - /url: /register
      - listitem [ref=e67]:
        - button "Switch to Light Mode" [ref=e68] [cursor=pointer]:
          - img [ref=e69]
          - text: Switch to Light Mode
  - generic [ref=e75]:
    - generic [ref=e77]:
      - generic [ref=e78]: 🏠
      - heading "Welcome Back" [level=1] [ref=e79]:
        - text: Welcome
        - text: Back
      - paragraph [ref=e80]: The easiest way to manage your student life. Log in to access your services, laundry status, and community.
      - generic [ref=e81]:
        - generic [ref=e82]:
          - generic [ref=e83]: "---"
          - generic [ref=e84]: Active Users
        - generic [ref=e85]:
          - generic [ref=e86]: "---"
          - generic [ref=e87]: Premium Partners
    - generic [ref=e89]:
      - generic [ref=e90]:
        - heading "Sign In" [level=2] [ref=e91]
        - paragraph [ref=e92]:
          - text: New here?
          - link "Create an account" [ref=e93] [cursor=pointer]:
            - /url: /register
      - generic [ref=e94]:
        - generic [ref=e95]:
          - generic [ref=e96]: Username
          - generic [ref=e97]:
            - img [ref=e98]
            - textbox "Enter your username" [ref=e101]
        - generic [ref=e102]:
          - generic [ref=e103]: Password
          - generic [ref=e104]:
            - img [ref=e105]
            - textbox "••••••••" [ref=e108]
            - button [ref=e109] [cursor=pointer]:
              - img [ref=e110]
        - generic [ref=e113]:
          - generic [ref=e114]:
            - checkbox "Remember me" [ref=e115]
            - text: Remember me
          - link "Forgot password?" [ref=e116] [cursor=pointer]:
            - /url: "#"
        - button "Sign In" [ref=e117] [cursor=pointer]:
          - generic [ref=e118]:
            - text: Sign In
            - img [ref=e119]
      - generic [ref=e122]: Or continue with
      - generic [ref=e123]:
        - button "G Google" [ref=e124] [cursor=pointer]:
          - img "G" [ref=e125]
          - text: Google
        - button "M Microsoft" [ref=e126] [cursor=pointer]:
          - img "M" [ref=e127]
          - text: Microsoft
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('Health Management', () => {
  4  |   test('should display medical pharmacy panel', async ({ page }) => {
  5  |     // Note: This page might require login. 
  6  |     // In a full test suite, you would perform login in a global setup or before each test.
  7  |     await page.goto('/health/medical-panel');
  8  |     
  9  |     // If redirected to login, this test will fail as expected if not authenticated.
  10 |     // Assuming we are authenticated or testing the public view if any:
  11 |     const header = page.locator('h1');
  12 |     await expect(header).toContainText('Medical Pharmacy Panel');
  13 |     
  14 |     // Check for inventory section
  15 |     const inventoryHeader = page.locator('h2');
  16 |     await expect(inventoryHeader).toContainText('Available medicines and supplies');
  17 |   });
  18 | 
  19 |   test('should show cart count', async ({ page }) => {
  20 |     await page.goto('/health/medical-panel');
  21 |     
  22 |     const cartTrigger = page.locator('.medical-cart-trigger');
> 23 |     await expect(cartTrigger).toBeVisible();
     |                               ^ Error: expect(locator).toBeVisible() failed
  24 |     await expect(cartTrigger.locator('strong')).toContainText('0');
  25 |   });
  26 | });
  27 | 
```