<script lang="ts">
  import FeedbackForm from "../components/feedback-form.svelte";
</script>

<section class="feedback-page" aria-labelledby="feedback-heading">
  <div class="feedback-card">
    <h2 id="feedback-heading" class="section-label">Feedback</h2>
    <p class="feedback-lead">
      Found a bug, inaccurate game value, or idea for a new calculator? Send feedback directly
      from this page. No account needed.
    </p>
    <p class="feedback-note">
      To keep data collection minimal, only your message is required. Name and email are
      optional.
    </p>
    <FeedbackForm />
  </div>
</section>
