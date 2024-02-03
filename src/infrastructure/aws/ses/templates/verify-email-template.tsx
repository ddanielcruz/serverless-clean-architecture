import {
  Html,
  Head,
  Preview,
  Body,
  Tailwind,
  Img,
  Container,
  Section,
  Heading,
  Button,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface VerifyEmailTemplateProps {
  url: string
}

export default function VerifyEmailTemplate({ url }: VerifyEmailTemplateProps) {
  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Preview>Verify your email &middot; Serverless</Preview>
      <Tailwind>
        <Body className="m-0 font-[Roboto]">
          <Container>
            <Section className="py-4 bg-zinc-900">
              <Img
                src="https://assets-global.website-files.com/60acbb950c4d66d0ab3e2007/60d841cfd24a7264a80c75fc_Serverless_logo.png"
                alt="Serverless"
                className="w-16 h-16 rounded-md mx-auto"
              />
            </Section>

            <Section className="bg-neutral-50 p-6">
              <Heading as="h2" className="m-0 text-zinc-800">
                Verify your email address
              </Heading>
              <Text className="m-0 text-zinc-700">
                Click the button below to verify your email address.
              </Text>

              <Section className="mx-auto w-full flex items-center justify-center mt-6">
                <Button
                  href={url}
                  className="bg-red-500 text-white font-medium tracking-wide rounded-md px-8 py-3"
                >
                  Verify email
                </Button>
              </Section>
            </Section>

            <Section className="bg-rose-50 p-6">
              <Text className="m-0 text-rose-700">
                If you did not create an account, no further action is required.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
