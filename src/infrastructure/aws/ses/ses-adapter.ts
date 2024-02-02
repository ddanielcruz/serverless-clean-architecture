import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

import { config } from '@/core/config'
import type {
  EmailSender,
  SendEmailParams,
} from '@/domain/users/email/email-sender'
import type { EmailTemplate } from '@/domain/users/email/email-template'

import { SES_OFFLINE_OPTIONS } from './ses-constants'

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
  }: SendEmailParams<TTemplate>): Promise<void> {
    // TODO Render email template
    const command = new SendEmailCommand({
      Source: this.emailSender,
      Destination: {
        ToAddresses: typeof to === 'string' ? [to] : to,
      },
      Message: {
        Subject: {
          Data: subject,
        },
        Body: {
          Html: {
            Data: 'Email body',
          },
        },
      },
    })

    await this.client.send(command)
  }
}
