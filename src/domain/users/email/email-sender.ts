import type { EmailTemplate, EmailTemplateData } from './email-template'

export interface SendEmailParams<TTemplate extends EmailTemplate> {
  to: string[]
  subject: string
  template: TTemplate
  data: EmailTemplateData[TTemplate]
}

export interface EmailSender {
  send<TTemplate extends EmailTemplate>(
    params: SendEmailParams<TTemplate>,
  ): Promise<void>
}
