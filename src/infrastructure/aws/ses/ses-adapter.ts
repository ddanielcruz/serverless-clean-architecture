import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { renderAsync } from '@react-email/render'

import { config } from '@/core/config'
import type {
  EmailSender,
  SendEmailParams,
} from '@/domain/users/email/email-sender'
import type { EmailTemplateData } from '@/domain/users/email/email-template'
import { EmailTemplate } from '@/domain/users/email/email-template'

import { SES_OFFLINE_OPTIONS } from './ses-constants'
import { VerifyEmailTemplate } from './templates/verify-email-template'

export class SESAdapter implements EmailSender {
  private readonly client: SESClient
  private readonly emailSender = config.get('EMAIL_SENDER')

  constructor() {
    const isOffline = config.get('IS_OFFLINE')
    this.client = new SESClient(isOffline ? SES_OFFLINE_OPTIONS : {})
  }

  async send<TTemplate extends EmailTemplate>({
    to,
    subject,
    template,
    data,
  }: SendEmailParams<TTemplate>): Promise<void> {
    const htmlContent = await this.renderTemplate(template, data)
    const command = new SendEmailCommand({
      Source: this.emailSender,
      Destination: {
        ToAddresses: typeof to === 'string' ? [to] : to,
      },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: htmlContent,
          },
        },
      },
    })

    await this.client.send(command)
  }

  private renderTemplate<TTemplate extends EmailTemplate>(
    template: TTemplate,
    data: EmailTemplateData[TTemplate],
  ): Promise<string> {
    switch (template) {
      case EmailTemplate.EmailVerification:
        return renderAsync(VerifyEmailTemplate(data))
      default:
        throw new Error(`Template ${template} not found`)
    }
  }
}
