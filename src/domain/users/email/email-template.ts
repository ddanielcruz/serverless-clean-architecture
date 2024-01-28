export enum EmailTemplate {
  EmailVerification = 'email-verification',
}

export type EmailTemplateData = {
  [EmailTemplate.EmailVerification]: { url: string }
}
