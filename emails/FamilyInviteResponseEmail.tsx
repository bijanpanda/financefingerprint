import {
  Html, Head, Body, Container, Heading, Text,
  Section, Hr, Preview,
} from "@react-email/components";

interface FamilyInviteResponseEmailProps {
  inviterFirstName: string;
  inviteeEmail: string;
  outcome: "accepted" | "declined";
}

export function FamilyInviteResponseEmail({ inviterFirstName, inviteeEmail, outcome }: FamilyInviteResponseEmailProps) {
  const accepted = outcome === "accepted";
  return (
    <Html>
      <Head />
      <Preview>
        {accepted ? `${inviteeEmail} joined your family on Vestrofin` : `${inviteeEmail} declined your family invite`}
      </Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "Arial, Helvetica, sans-serif", margin: 0, padding: "32px 0" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

          {/* Header */}
          <Section style={{ background: "linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)", padding: "32px 40px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "20px" }}>💰</span>
              </div>
              <div style={{ textAlign: "left" }}>
                <Text style={{ color: "#ffffff", margin: 0, fontSize: "18px", fontWeight: "bold", lineHeight: "1.2" }}>Vestrofin</Text>
                <Text style={{ color: "rgba(255,255,255,0.75)", margin: 0, fontSize: "12px" }}>Your Money. Your DNA.</Text>
              </div>
            </div>
          </Section>

          {/* Body */}
          <Section style={{ padding: "36px 40px 0" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: accepted ? "#ecfdf5" : "#f8fafc", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "32px" }}>{accepted ? "🎉" : "📭"}</span>
              </div>
              <Heading style={{ color: "#1e293b", fontSize: "22px", fontWeight: "bold", margin: "0 0 8px" }}>
                {accepted ? "Your family invite was accepted" : "Your family invite was declined"}
              </Heading>
              <Text style={{ color: "#64748b", fontSize: "15px", lineHeight: "1.7", margin: 0 }}>
                Hi {inviterFirstName}, {accepted
                  ? <><strong>{inviteeEmail}</strong> has joined your family group on Vestrofin.</>
                  : <><strong>{inviteeEmail}</strong> chose not to join your family group. No changes were made to their account.</>}
              </Text>
            </div>

            <Hr style={{ borderColor: "#e2e8f0", margin: "24px 0 32px" }} />
          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: "#f8fafc", padding: "20px 40px", borderTop: "1px solid #e2e8f0" }}>
            <Text style={{ color: "#64748b", fontSize: "13px", margin: "0 0 6px", textAlign: "center", lineHeight: "1.6" }}>
              Thanks,<br />
              <strong style={{ color: "#475569" }}>Vestrofin</strong>
            </Text>
            <Text style={{ color: "#cbd5e1", fontSize: "11px", margin: 0, textAlign: "center" }}>
              Vestrofin · Not financial advice
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}
