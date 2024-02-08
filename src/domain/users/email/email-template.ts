export enum EmailTemplate {
  EmailVerification = 'email-verification',
  Authentication = 'authentication',
}

export type EmailTemplateData = {
  [EmailTemplate.EmailVerification]: { url: string }
  [EmailTemplate.Authentication]: { url: string }
}
