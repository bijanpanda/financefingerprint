import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Section,
  Hr,
  Preview,
} from "@react-email/components";

interface WelcomeEmailProps {
  firstName: string;
  currency: string;
}

export function WelcomeEmail({ firstName, currency }: WelcomeEmailProps) {
  const isIndia = currency === "INR";

  return (
    <Html>
      <Head />
      <Preview>Welcome to Vestrofin — your financial journey starts now</Preview>
      <Body style={{ backgroundColor: "#f0fdf4", fontFamily: "Arial, sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 20px rgba(5,150,105,0.1)" }}>
          {/* Header */}
          <Section style={{ background: "linear-gradient(135deg, #059669 0%, #0d9488 40%, #0891b2 100%)", padding: "32px 40px", textAlign: "center" }}>
            <Heading style={{ color: "#ffffff", margin: 0, fontSize: "24px", fontWeight: "bold", letterSpacing: "-0.5px" }}>
              💰 Vestrofin
            </Heading>
            <Text style={{ color: "rgba(255,255,255,0.85)", margin: "8px 0 0", fontSize: "14px" }}>
              Your Money. Your Plan.
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ padding: "40px" }}>
            <Heading style={{ color: "#1e293b", fontSize: "22px", margin: "0 0 8px" }}>
              Welcome, {firstName}! 🎉
            </Heading>
            <Text style={{ color: "#475569", fontSize: "15px", lineHeight: "1.6", margin: "0 0 24px" }}>
              Your account is set up and ready to go. Here&apos;s how to get the most out of Vestrofin:
            </Text>

            <Hr style={{ borderColor: "#e2e8f0", margin: "0 0 24px" }} />

            <Heading as="h2" style={{ color: "#059669", fontSize: "16px", margin: "0 0 16px" }}>
              Getting Started
            </Heading>

            {[
              { step: "1", title: "Complete Your Financial DNA Profile", desc: "Answer a short questionnaire to discover your investor persona — Guardian, Balancer, Climber, or Maverick." },
              { step: "2", title: "Set Your Monthly Budget", desc: "Add your income sources, plan your expenses, and track actuals as the month progresses." },
              { step: "3", title: "Track Every Transaction", desc: "Log transactions directly against budget items and watch your actuals update in real time." },
              ...(isIndia ? [{ step: "4", title: "80C Tax Planning (India)", desc: "Optimise your Section 80C investments — PPF, ELSS, LIC, and more — to maximise your tax savings." }] : []),
            ].map(({ step, title, desc }) => (
              <Section key={step} style={{ marginBottom: "16px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <Text style={{ margin: 0, fontSize: "15px", color: "#1e293b", lineHeight: "1.5" }}>
                  <span style={{ display: "inline-block", width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #059669, #0d9488)", color: "#fff", textAlign: "center", lineHeight: "28px", fontSize: "13px", fontWeight: "bold", marginRight: "10px", verticalAlign: "middle" }}>{step}</span>
                  <strong>{title}</strong>
                  <br />
                  <span style={{ color: "#64748b", fontSize: "13px", paddingLeft: "38px", display: "inline-block" }}>{desc}</span>
                </Text>
              </Section>
            ))}

            <Hr style={{ borderColor: "#e2e8f0", margin: "24px 0" }} />

            <Section style={{ textAlign: "center" }}>
              <Button
                href="https://vestrofin.com/dashboard"
                style={{ backgroundColor: "#059669", color: "#ffffff", padding: "14px 32px", borderRadius: "8px", fontSize: "15px", fontWeight: "bold", textDecoration: "none", display: "inline-block" }}
              >
                Go to My Dashboard →
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: "#f8fafc", padding: "24px 40px", borderTop: "1px solid #e2e8f0" }}>
            <Text style={{ color: "#64748b", fontSize: "13px", margin: "0 0 8px", textAlign: "center", lineHeight: "1.6" }}>
              Thanks,<br />
              <strong>Vestrofin</strong>
            </Text>
            <Text style={{ color: "#94a3b8", fontSize: "11px", margin: 0, textAlign: "center" }}>
              Vestrofin · Not financial advice · {" "}
              <a href="https://vestrofin.com/unsubscribe" style={{ color: "#94a3b8" }}>Unsubscribe</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
