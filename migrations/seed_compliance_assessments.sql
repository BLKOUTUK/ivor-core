-- Seed initial compliance assessments
-- Deploy: SUPABASE_ACCESS_TOKEN=... node scripts/supabase-query.mjs apps/ivor-core/migrations/seed_compliance_assessments.sql

-- ══════════════════════════════════════════
-- COOPERATIVE PRINCIPLES (ICA)
-- ══════════════════════════════════════════

INSERT INTO compliance_assessments (framework, framework_display, category, principle, principle_display, principle_description, status, met_count, total_count, evidence, gaps, action_plan, target_date, assessed_by, sort_order)
VALUES
('ica_principles', 'ICA Cooperative Principles', 'cooperative', 'voluntary_open_membership', 'Voluntary & Open Membership', 'Open to all persons able to use services, without gender, social, racial, political or religious discrimination.', 'met', 4, 4, 'Open registration on blkoutuk.com. No gatekeeping. Free membership tier available. Explicit welcome to all Black queer men and allies.', NULL, NULL, NULL, 'manual', 1),

('ica_principles', 'ICA Cooperative Principles', 'cooperative', 'democratic_member_control', 'Democratic Member Control', 'Members actively participate in setting policies and making decisions. One member, one vote.', 'partially_met', 2, 4, 'Board recruitment underway (Feb 2026). Governance page exists. CBS membership model with democratic principles.', 'Board not yet fully constituted. Formal voting mechanisms not yet implemented. No AGM held yet.', 'Complete board recruitment. Implement member voting on governance proposals. Schedule first AGM.', '2026-06-30', 'manual', 2),

('ica_principles', 'ICA Cooperative Principles', 'cooperative', 'member_economic_participation', 'Member Economic Participation', 'Members contribute equitably to, and democratically control, the capital of their cooperative.', 'partially_met', 2, 4, 'CBS membership tiers (free / £3mo / £10mo). Pre-order shop model. Transparent about funding sources.', 'Stripe payments not yet live. No surplus distribution policy. Member economic reports not published.', 'Activate Stripe payments. Draft surplus distribution policy. Publish financial transparency report.', '2026-06-30', 'manual', 3),

('ica_principles', 'ICA Cooperative Principles', 'cooperative', 'autonomy_independence', 'Autonomy & Independence', 'Autonomous, self-help organisation controlled by members. Maintains democratic control in external agreements.', 'met', 4, 4, 'Self-hosted on own server (Coolify). Data sovereignty enforced via Layer 3 business logic. No external investor control. Community data stays with community.', NULL, NULL, NULL, 'manual', 4),

('ica_principles', 'ICA Cooperative Principles', 'cooperative', 'education_training', 'Education, Training & Information', 'Provide education and training for members, representatives, managers and employees.', 'partially_met', 3, 4, 'IVOR AI assistant provides information and resources. Events calendar promotes learning events. UK knowledge base with regional resources.', 'No formal member training programme. Board induction materials not yet created.', 'Create board induction pack. Develop member education resources about cooperative governance.', '2026-09-30', 'manual', 5),

('ica_principles', 'ICA Cooperative Principles', 'cooperative', 'cooperation_among_cooperatives', 'Cooperation Among Cooperatives', 'Serve members most effectively by working together through local, national and international structures.', 'partially_met', 2, 4, 'Partnership with BMHWA (Black Mental Health & Wellbeing Alliance). Verified community orgs in IVOR knowledge base. Links to Gendered Intelligence, Stonewall, UK Black Pride.', 'Not yet a Co-operatives UK member. No formal cooperative partnerships. Not part of any cooperative federation.', 'Join Co-operatives UK. Explore partnerships with other LGBTQ+ cooperatives. Connect with Platform 6 network.', '2026-09-30', 'manual', 6),

('ica_principles', 'ICA Cooperative Principles', 'cooperative', 'concern_for_community', 'Concern for Community', 'Work for the sustainable development of communities through policies approved by members.', 'met', 4, 4, 'Liberation values enforced at code level (Layer 3 validation). Trauma-informed UX. Anti-oppression monitoring. 75% joy quotient in communications. Community-centred AI (IVOR).', NULL, NULL, NULL, 'manual', 7),

-- ══════════════════════════════════════════
-- CO-OPERATIVE GOVERNANCE CODE
-- ══════════════════════════════════════════

('coop_gov_code', 'Co-operative Governance Code', 'governance', 'member_voice', 'Member Voice & Participation', 'The board should ensure effective member engagement, with accessible democratic processes.', 'partially_met', 1, 4, 'Governance page exists on blkoutuk.com. Board recruitment actively promoted.', 'No member survey conducted. No formal feedback mechanism beyond IVOR. Democratic voting not implemented.', 'Implement member feedback surveys. Add governance proposal voting. Publish member engagement report.', '2026-06-30', 'manual', 10),

('coop_gov_code', 'Co-operative Governance Code', 'governance', 'leadership_purpose', 'Co-op Leadership & Purpose', 'The board should provide leadership aligned with the co-operative''s purpose and values.', 'partially_met', 2, 4, 'Clear mission: liberation platform for Black queer communities. Values encoded in Layer 3 business logic. Board recruitment criteria include values alignment.', 'Board not yet fully constituted. No published strategic plan. Purpose statement needs member approval.', 'Complete board formation. Draft and publish strategic plan. Hold member approval of purpose statement.', '2026-06-30', 'manual', 11),

('coop_gov_code', 'Co-operative Governance Code', 'governance', 'roles_responsibilities', 'Roles & Responsibilities', 'Clear division between board governance and operational management.', 'not_met', 0, 4, NULL, 'Board not yet formed — currently founder-led. No governance framework document. No terms of reference for board roles.', 'Draft governance framework. Create role descriptions and terms of reference. Establish board-management boundary.', '2026-09-30', 'manual', 12),

('coop_gov_code', 'Co-operative Governance Code', 'governance', 'board_composition', 'Board Composition & Succession', 'Board should reflect the diversity of the membership, with regular renewal.', 'partially_met', 1, 4, 'Board recruitment specifically seeks diversity (Feb 2026 campaign). Open call with clear criteria.', 'Board not yet constituted. No succession policy. No skills audit completed.', 'Complete initial board appointments. Conduct skills audit. Draft succession and rotation policy.', '2026-06-30', 'manual', 13),

('coop_gov_code', 'Co-operative Governance Code', 'governance', 'risk_management', 'Risk & Financial Management', 'Effective risk management and financial oversight with transparency to members.', 'partially_met', 1, 4, 'Health dashboard monitors service status. Infrastructure monitoring in place. Grant pipeline tracked.', 'No formal risk register. No published financial reports. No internal audit process.', 'Create risk register. Publish quarterly financial summary. Establish financial controls and audit trail.', '2026-09-30', 'manual', 14),

('coop_gov_code', 'Co-operative Governance Code', 'governance', 'remuneration', 'Remuneration', 'Fair and transparent approach to any payments, aligned with co-operative values.', 'not_assessed', 0, 4, NULL, 'Currently volunteer-run. No remuneration policy needed yet but should be drafted before any payments begin.', 'Draft remuneration principles for when the co-op has income. Align with co-operative values of equity.', '2026-12-31', 'manual', 15),

-- ══════════════════════════════════════════
-- DATA PROTECTION (UK GDPR)
-- ══════════════════════════════════════════

('gdpr', 'UK GDPR / Data Protection', 'governance', 'data_protection', 'Data Protection & Privacy', 'Lawful processing, purpose limitation, data minimisation, accuracy, storage limitation, security, accountability.', 'partially_met', 2, 4, 'Privacy policy exists on blkoutuk.com. Conversation data anonymised via hashing. Data stored in EU-region Supabase. Layer 3 data sovereignty enforcement.', 'No formal DSAR process. No data processing register. No DPO appointed. Cookie consent mechanism basic.', 'Document data processing activities. Implement DSAR request form. Review and strengthen cookie consent.', '2026-06-30', 'manual', 16),

-- ══════════════════════════════════════════
-- SAFEGUARDING
-- ══════════════════════════════════════════

('safeguarding', 'Safeguarding', 'governance', 'safeguarding', 'Safeguarding Policy', 'Protection of vulnerable adults, particularly in online community spaces handling sensitive topics.', 'partially_met', 1, 4, 'IVOR has crisis detection and signposting to Samaritans/Switchboard. Journey-aware responses adjust for emotional state. Anti-oppression monitoring active.', 'No formal safeguarding policy document. No designated safeguarding lead. No incident reporting process.', 'Draft safeguarding policy. Appoint designated safeguarding lead from board. Create incident reporting workflow.', '2026-06-30', 'manual', 17),

-- ══════════════════════════════════════════
-- AI TRANSPARENCY
-- ══════════════════════════════════════════

('ai_transparency', 'AI Transparency', 'digital_inclusion', 'ai_disclosure', 'AI Use Disclosure', 'Clear disclosure of AI systems, how they work, what data they use, and member choices.', 'partially_met', 2, 4, 'IVOR identified as AI in conversation. System uses GROQ/Qwen LLMs for responses. Conversation intelligence extracts themes for community benefit.', 'No public AI transparency statement. No explanation of how AI decisions affect content shown. LLM Council not yet disclosed. No opt-out mechanism for AI features.', 'Publish AI transparency page. Explain data flows clearly. Add opt-out for AI-driven features. Disclose LLM Council process.', '2026-06-30', 'manual', 20),

('ai_transparency', 'AI Transparency', 'digital_inclusion', 'ai_ethics', 'AI Ethics & Values Alignment', 'AI systems should be aligned with cooperative values, avoid bias, and centre community benefit.', 'met', 3, 4, 'Layer 3 Liberation Business Logic enforces values at code level. 75% joy quotient in AI communications. Anti-oppression monitoring. Honest Response Guard prevents fabrication. Constitutional AI approach via system prompts.', 'No external AI ethics audit conducted.', 'Commission or self-conduct AI ethics review. Publish findings.', '2026-12-31', 'manual', 21),

-- ══════════════════════════════════════════
-- ACCESSIBILITY
-- ══════════════════════════════════════════

('accessibility', 'Accessibility (WCAG 2.1 AA)', 'digital_inclusion', 'accessibility', 'Digital Accessibility', 'Web content should be perceivable, operable, understandable, and robust for all users.', 'partially_met', 2, 4, 'Accessibility tests in CI pipeline. Semantic HTML used. Alt text on key images. Responsive design.', 'No formal WCAG audit conducted. Screen reader testing incomplete. Colour contrast may not meet AA in all components. No accessibility statement published.', 'Conduct WCAG 2.1 AA audit. Fix identified issues. Publish accessibility statement with contact for issues.', '2026-09-30', 'manual', 22),

-- ══════════════════════════════════════════
-- CHARITY DIGITAL CODE
-- ══════════════════════════════════════════

('digital_code', 'Charity Digital Code of Practice', 'digital_inclusion', 'digital_code', 'Digital Best Practice', '7 principles: leadership, skills, culture, data, infrastructure, security, innovation.', 'partially_met', 4, 7, 'Strong digital infrastructure (self-hosted, 9 services). Innovation via AI (IVOR, LLM Council). Data-driven approach (intelligence system). Security via Coolify/Docker isolation.', 'Board digital literacy unknown. No digital skills development plan. Digital culture not formally assessed.', 'Assess board digital skills. Create digital strategy document. Review against all 7 principles in detail.', '2026-09-30', 'manual', 23),

-- ══════════════════════════════════════════
-- STONEWALL
-- ══════════════════════════════════════════

('stonewall', 'Stonewall Best Practice', 'digital_inclusion', 'lgbtq_inclusion', 'LGBTQ+ Inclusion Standards', 'Evidence-based standards for LGBTQ+ inclusive services, communication, and governance.', 'met', 4, 4, 'Organisation exists specifically for Black LGBTQ+ community. All services designed with community. Pronouns supported in profiles. Trauma-informed approach. Intersectional by design.', NULL, 'Consider formal Stonewall benchmarking for external validation.', '2026-12-31', 'manual', 24)

ON CONFLICT DO NOTHING;
