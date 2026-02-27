-- ============================================
-- RSVP Confirmation Trigger
-- Logs to notification_log when a new RSVP is created
-- ============================================

CREATE OR REPLACE FUNCTION notify_rsvp_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only fire for confirmed RSVPs (not waitlist or cancelled)
  IF NEW.status = 'confirmed' THEN
    INSERT INTO notification_log (id, title, body, topic, sent_count, success_count, failure_count)
    VALUES (
      gen_random_uuid(),
      'RSVP Confirmation',
      format('RSVP confirmed for %s (%s) - Event: %s, Check-in code: %s, Guests: %s',
        COALESCE(NEW.attendee_name, 'Unknown'),
        COALESCE(NEW.attendee_email, 'no email'),
        NEW.event_id,
        COALESCE(NEW.check_in_code, 'N/A'),
        COALESCE(NEW.guest_count, 0)::text
      ),
      'rsvp_confirmation',
      0, 0, 0
    );
  ELSIF NEW.status = 'waitlist' THEN
    INSERT INTO notification_log (id, title, body, topic, sent_count, success_count, failure_count)
    VALUES (
      gen_random_uuid(),
      'RSVP Waitlisted',
      format('Waitlisted: %s (%s) for event %s',
        COALESCE(NEW.attendee_name, 'Unknown'),
        COALESCE(NEW.attendee_email, 'no email'),
        NEW.event_id
      ),
      'rsvp_waitlist',
      0, 0, 0
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_rsvp_confirmation ON event_rsvps;
CREATE TRIGGER trigger_rsvp_confirmation
  AFTER INSERT ON event_rsvps
  FOR EACH ROW
  EXECUTE FUNCTION notify_rsvp_confirmation();

-- ============================================
-- Welcome Email Trigger
-- Logs to notification_log when a new contact is created
-- ============================================

CREATE OR REPLACE FUNCTION notify_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_log (id, title, body, topic, sent_count, success_count, failure_count)
  VALUES (
    gen_random_uuid(),
    'Welcome Email',
    format('New contact: %s %s (%s) - Send welcome email',
      COALESCE(NEW.first_name, ''),
      COALESCE(NEW.last_name, ''),
      COALESCE(NEW.email, 'no email')
    ),
    'welcome_email',
    0, 0, 0
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_welcome_email ON contacts;
CREATE TRIGGER trigger_welcome_email
  AFTER INSERT ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION notify_welcome_email();
