import {
  Html, Head, Body, Container, Heading, Text,
  Section, Hr, Preview,
} from "@react-email/components";

interface FamilyRemovedEmailProps {
  firstName: string;
  initiatorName: string;
  reason: "removed" | "left";
}

export function FamilyRemovedEmail({ firstName, initiatorName, reason }: FamilyRemovedEmailProps) {
  const removed = reason === "removed";
  return (
    <Html>
      <Head />
      <Preview>{removed ? `You've been removed from ${initiatorName}'s family` : "You've left the family"}</Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "Arial, Helvetica, sans-serif", margin: 0, padding: "32px 0" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

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

          <Section style={{ padding: "36px 40px 0" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#f8fafc", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "32px" }}>👋</span>
              </div>
              <Heading style={{ color: "#1e293b", fontSize: "22px", fontWeight: "bold", margin: "0 0 8px" }}>
                {removed ? "You're no longer part of this family" : "You've left the family"}
              </Heading>
              <Text style={{ color: "#64748b", fontSize: "15px", lineHeight: "1.7", margin: 0 }}>
                Hi {firstName}, {removed
                  ? <>you&apos;ve been removed from <strong>{initiatorName}</strong>&apos;s family on Vestrofin.</>
                  : <>you&apos;ve left <strong>{initiatorName}</strong>&apos;s family on Vestrofin.</>} Your budget
                data hasn&apos;t changed — it&apos;s still exactly as you left it, just no longer shared with
                this family group.
              </Text>
            </div>

            <Hr style={{ borderColor: "#e2e8f0", margin: "24px 0 32px" }} />
          </Section>

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
