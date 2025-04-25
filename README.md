# Frayze Stack Builder

A customizable tool for building technology stacks based on business requirements.

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
VITE_WEBHOOK_URL=https://n8n.frayze.ca/webhook-test/d685ac24-5d07-43af-8311-bac8fbfe651d
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Features

- Business profile analysis
- AI-recommended technology stacks
- Custom add-on selection
- Contact form with webhook integration
- Responsive design

## Webhook Integration

The contact form submits data to the configured webhook URL. The payload includes:

- Form data (business information, contact details)
- Selected add-ons
- Total price 