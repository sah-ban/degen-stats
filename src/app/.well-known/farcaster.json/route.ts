export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config =
{
  "accountAssociation": {
    header: "eyJmaWQiOjI2ODQzOCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDIxODA4RUUzMjBlREY2NGMwMTlBNmJiMEY3RTRiRkIzZDYyRjA2RWMifQ",
    payload: "eyJkb21haW4iOiJ0ZXN0LWRlZ2VuLnZlcmNlbC5hcHAifQ",
    signature: "MHhjN2JlMzVmZGUyODhmNmZlMDExNzA5YzAyYjY2MDIxMWMyMWM5OTJiNzMwNzZhZDc3ZWE2OWQxNGE3NmNlZWUwMjFmZDdlZTg5ZGRhMzBkNTE3MmYzYjM0MWYwOGQ5YWYzNDllZTQyOTlkZWFhYzc0YjkyM2I2MWQ5YmI2MTM1MzFj"
  },
  frame: {
    version: "1",
    name: "TEST",
    iconUrl: "https://raw.githubusercontent.com/cashlessman/images/refs/heads/main/degen_logo.png",
    homeUrl: appUrl,
    imageUrl: "https://raw.githubusercontent.com/cashlessman/images/refs/heads/main/degen.png",
    buttonTitle: "SEE",
    splashImageUrl: `https://raw.githubusercontent.com/cashlessman/images/refs/heads/main/pfp.png`,

    // splashImageUrl: "https://degen-v2.vercel.app/splash.png",
    splashBackgroundColor: "#333333",
    webhookUrl: "https://degen-v2.vercel.app/api/webhook"
    },
  };

  return Response.json(config);
}