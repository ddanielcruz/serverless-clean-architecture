import {
  Html,
  Head,
  Preview,
  Body,
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

const styles: Record<string, React.CSSProperties> = {
  main: {
    backgroundColor: '#ffffff',
    fontFamily: 'Roboto, sans-serif',
    margin: 0,
  },
  logoContainer: {
    padding: '24px',
    backgroundColor: '#3f3f46',
  },
  logo: {
    width: '64px',
    height: '64px',
    borderRadius: '8px',
    margin: '0 auto',
  },
  contentContainer: {
    padding: '24px',
  },
  heading: {
    marginTop: '0',
    marginBottom: '8px',
    color: '#232129',
  },
  text: {
    margin: '0',
    color: '#232129',
  },
  buttonContainer: {
    textAlign: 'center',
    marginTop: '24px',
  },
  button: {
    backgroundColor: '#EA6358',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
    fontWeight: '500',
  },
  footer: {
    padding: '24px',
    backgroundColor: '#f7f7f7',
  },
}

export default function VerifyEmailTemplate({
  url = 'https://example.com',
}: VerifyEmailTemplateProps) {
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
      <Body style={styles.main}>
        <Container>
          <Section style={styles.logoContainer}>
            <Img
              src="https://assets-global.website-files.com/60acbb950c4d66d0ab3e2007/60d841cfd24a7264a80c75fc_Serverless_logo.png"
              alt="Serverless"
              style={styles.logo}
            />
          </Section>

          <Section style={styles.contentContainer}>
            <Heading as="h2" style={styles.heading}>
              Verify your email address
            </Heading>
            <Text style={styles.text}>
              Click the button below to verify your email address.
            </Text>

            <div style={styles.buttonContainer}>
              <Button href={url} style={styles.button}>
                Verify email
              </Button>
            </div>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.text}>
              If you did not create an account, no further action is required.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
