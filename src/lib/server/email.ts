// server-only — do NOT import in client components
import "server-only";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { WelcomeEmail } from "../../../emails/WelcomeEmail";
import { FamilyInviteEmail } from "../../../emails/FamilyInviteEmail";
import { FamilyInviteResponseEmail } from "../../../emails/FamilyInviteResponseEmail";
import { ChildBudgetEditedEmail } from "../../../emails/ChildBudgetEditedEmail";
import { FamilyRemovedEmail } from "../../../emails/FamilyRemovedEmail";
import { FamilyOwnershipTransferEmail } from "../../../emails/FamilyOwnershipTransferEmail";
import { FamilyOrphanedEmail } from "../../../emails/FamilyOrphanedEmail";
import { FamilyGraduationEmail } from "../../../emails/FamilyGraduationEmail";
import { FamilyMemberLeftEmail } from "../../../emails/FamilyMemberLeftEmail";
import { FamilyRole } from "@/types/family";

export async function sendWelcomeEmail({
  toEmail,
  firstName,
  currency,
}: {
  toEmail: string;
  firstName: string;
  currency: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  const resend = new Resend(apiKey);
  const html = await render(WelcomeEmail({ firstName, currency }));
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "welcome@vestrofin.com",
    to: toEmail,
    subject: `Welcome to Vestrofin, ${firstName}!`,
    html,
  });
  if (error) throw new Error(`Resend rejected welcome email: ${error.message}`);
}

export async function sendFamilyInviteEmail({
  toEmail,
  inviterName,
  role,
  inviteUrl,
  isExistingAccount,
}: {
  toEmail: string;
  inviterName: string;
  role: FamilyRole;
  inviteUrl: string;
  isExistingAccount: boolean;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  const resend = new Resend(apiKey);
  const html = await render(FamilyInviteEmail({ inviterName, role, inviteUrl, isExistingAccount }));
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: toEmail,
    subject: `${inviterName} invited you to their Family Budget on Vestrofin`,
    html,
  });
  if (error) throw new Error(`Resend rejected family invite email: ${error.message}`);
}

export async function sendFamilyInviteResponseEmail({
  toEmail,
  inviterFirstName,
  inviteeEmail,
  outcome,
}: {
  toEmail: string;
  inviterFirstName: string;
  inviteeEmail: string;
  outcome: "accepted" | "declined";
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  const resend = new Resend(apiKey);
  const html = await render(FamilyInviteResponseEmail({ inviterFirstName, inviteeEmail, outcome }));
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: toEmail,
    subject: outcome === "accepted" ? "Your family invite was accepted" : "Your family invite was declined",
    html,
  });
  if (error) throw new Error(`Resend rejected family invite response email: ${error.message}`);
}

export async function sendChildBudgetEditedEmail({
  toEmail,
  childFirstName,
  editorName,
  changeSummary,
}: {
  toEmail: string;
  childFirstName: string;
  editorName: string;
  changeSummary: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  const resend = new Resend(apiKey);
  const html = await render(ChildBudgetEditedEmail({ childFirstName, editorName, changeSummary }));
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: toEmail,
    subject: `${editorName} made a change to your budget`,
    html,
  });
  if (error) throw new Error(`Resend rejected child budget edited email: ${error.message}`);
}

export async function sendFamilyRemovedEmail({
  toEmail,
  firstName,
  initiatorName,
  reason,
}: {
  toEmail: string;
  firstName: string;
  initiatorName: string;
  reason: "removed" | "left";
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  const resend = new Resend(apiKey);
  const html = await render(FamilyRemovedEmail({ firstName, initiatorName, reason }));
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: toEmail,
    subject: reason === "removed" ? "You've been removed from a family on Vestrofin" : "You've left your family on Vestrofin",
    html,
  });
  if (error) throw new Error(`Resend rejected family removed email: ${error.message}`);
}

export async function sendFamilyOwnershipTransferEmail({
  toEmail,
  firstName,
  previousInitiatorName,
}: {
  toEmail: string;
  firstName: string;
  previousInitiatorName: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  const resend = new Resend(apiKey);
  const html = await render(FamilyOwnershipTransferEmail({ firstName, previousInitiatorName }));
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: toEmail,
    subject: "You're now the organizer of your family on Vestrofin",
    html,
  });
  if (error) throw new Error(`Resend rejected ownership transfer email: ${error.message}`);
}

export async function sendFamilyOrphanedEmail({
  toEmail,
  firstName,
  initiatorName,
  familyUrl,
}: {
  toEmail: string;
  firstName: string;
  initiatorName: string;
  familyUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  const resend = new Resend(apiKey);
  const html = await render(FamilyOrphanedEmail({ firstName, initiatorName, familyUrl }));
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: toEmail,
    subject: `${initiatorName} is no longer part of your family on Vestrofin`,
    html,
  });
  if (error) throw new Error(`Resend rejected orphaned family email: ${error.message}`);
}

export async function sendFamilyGraduationEmail({
  toEmail,
  firstName,
}: {
  toEmail: string;
  firstName: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  const resend = new Resend(apiKey);
  const html = await render(FamilyGraduationEmail({ firstName }));
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: toEmail,
    subject: "Congratulations on your independent Vestrofin account!",
    html,
  });
  if (error) throw new Error(`Resend rejected graduation email: ${error.message}`);
}

export async function sendFamilyMemberLeftEmail({
  toEmail,
  initiatorFirstName,
  memberName,
}: {
  toEmail: string;
  initiatorFirstName: string;
  memberName: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  const resend = new Resend(apiKey);
  const html = await render(FamilyMemberLeftEmail({ initiatorFirstName, memberName }));
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: toEmail,
    subject: `${memberName} left your family on Vestrofin`,
    html,
  });
  if (error) throw new Error(`Resend rejected member-left email: ${error.message}`);
}
