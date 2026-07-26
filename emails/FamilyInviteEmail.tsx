import {
  Html, Head, Body, Container, Heading, Text,
  Button, Section, Hr, Preview,
} from "@react-email/components";

interface FamilyInviteEmailProps {
  inviterName: string;
  role: "principal" | "child";
  inviteUrl: string;
  isExistingAccount: boolean;
}

const ROLE_LABEL: Record<"principal" | "child", string> = {
  principal: "Principal (full access)",
  child: "Child (simplified budget)",
};

export function FamilyInviteEmail({ inviterName, role, inviteUrl, isExistingAccount }: FamilyInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{inviterName} invited you to join their family on Vestrofin</Preview>
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
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#ecfdf5", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "32px" }}>👨‍👩‍👧</span>
              </div>
              <Heading style={{ color: "#1e293b", fontSize: "22px", fontWeight: "bold", margin: "0 0 8px" }}>
                You&apos;ve been invited to a Family Budget
              </Heading>
              <Text style={{ color: "#64748b", fontSize: "15px", lineHeight: "1.7", margin: 0 }}>
                <strong>{inviterName}</strong> invited you to join their family on Vestrofin as a{" "}
                <strong>{ROLE_LABEL[role]}</strong>.
              </Text>
            </div>

            {isExistingAccount && (
              <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "14px 18px", marginBottom: "20px" }}>
                <Text style={{ color: "#92400e", fontSize: "13px", margin: 0, lineHeight: "1.6" }}>
                  This invite matches the email on your existing Vestrofin account. Accepting will link your
                  account to {inviterName}&apos;s family group. If you&apos;d rather stay independent, just decline
                  and nothing about your account will change.
                </Text>
              </div>
            )}

            <Hr style={{ borderColor: "#e2e8f0", margin: "24px 0" }} />

            <Section style={{ textAlign: "center", padding: "0 0 32px" }}>
              <Button
                href={inviteUrl}
                style={{ backgroundColor: "#059669", color: "#ffffff", padding: "14px 40px", borderRadius: "10px", fontSize: "16px", fontWeight: "bold", textDecoration: "none", display: "inline-block" }}
              >
                View invite →
              </Button>
              <Text style={{ color: "#94a3b8", fontSize: "12px", margin: "16px 0 0" }}>
                This link can only be used once.
              </Text>
            </Section>

            <div style={{ backgroundColor: "#f8fafc", borderRadius: "10px", padding: "16px 20px", marginBottom: "24px" }}>
              <Text style={{ color: "#64748b", fontSize: "13px", margin: "0 0 6px" }}>
                If the button doesn&apos;t work, copy and paste this link into your browser:
              </Text>
              <Text style={{ color: "#059669", fontSize: "12px", margin: 0, wordBreak: "break-all" }}>
                {inviteUrl}
              </Text>
            </div>

            <Text style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 24px" }}>
              If you weren&apos;t expecting this, you can safely ignore this email or open the link and decline.
            </Text>
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
