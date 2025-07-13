import Brevo from '@getbrevo/brevo';

const brevoClient = new Brevo.TransactionalEmailsApi();

brevoClient.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

export const SENDER = {
  name: 'Tamkeen Organization',
  email: 'no-reply@tamkeen.org'
};

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

export default brevoClient;
