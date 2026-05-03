<form
  class="feedback-form"
  name="user-feedback"
  method="POST"
  data-netlify="true"
  netlify-honeypot="bot-field"
  action="/feedback/"
>
  <input type="hidden" name="form-name" value="user-feedback" />
  <p class="feedback-honeypot" aria-hidden="true">
    <label>
      Leave this field empty
      <input name="bot-field" />
    </label>
  </p>

  <div class="feedback-control">
    <label for="feedback-name">Name (optional)</label>
    <input id="feedback-name" name="name" type="text" autocomplete="name" maxlength="80" />
  </div>

  <div class="feedback-control">
    <label for="feedback-email">Email (optional)</label>
    <input id="feedback-email" name="email" type="email" autocomplete="email" maxlength="120" />
  </div>

  <div class="feedback-control feedback-control--full">
    <label for="feedback-message">Message</label>
    <textarea
      id="feedback-message"
      name="message"
      rows="5"
      maxlength="2000"
      required
    ></textarea>
  </div>

  <div class="feedback-control feedback-control--full feedback-checkbox">
    <input id="feedback-consent" name="privacy-consent" type="checkbox" required />
    <label for="feedback-consent">
      I have read the <a href="/privacy/">Privacy Notice</a> and agree to sending this feedback.
    </label>
  </div>

  <button class="feedback-submit" type="submit">Send feedback</button>
</form>
