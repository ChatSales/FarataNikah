// Free-tier daily limits, per the pricing copy. Premium profiles bypass
// these entirely (checked via profiles.is_premium before ever calling
// increment_and_check_counter).
export const FREE_DAILY_CONTACT_REQUESTS = 5;
export const FREE_DAILY_COACH_QUESTIONS = 3;
