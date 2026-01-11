const express = require("express");
const router = express.Router();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/send", async (req, res) => {
  try {
    const { type, area } = req.body;

    if (!type || !area) {
      return res.status(400).json({
        success: false,
        message: "Missing fields"
      });
    }

    let subject = "";
    let htmlMessage = "";

    if (type === "investigate") {
      subject = `⚠️ Theft Investigation Alert – ${area}`;
      htmlMessage = `
        <h2 style="color:#d32f2f;">⚡ Electricity Theft Detected</h2>
        <p>Dear Investigation Team,</p>
        <p>Our IoT monitoring system has detected an unusual power loss beyond the 5% tolerance level in the area <strong>${area}</strong>.</p>
        <p>This could indicate a possible electricity theft event.</p>
        <ul>
          <li><b>Action Required:</b> Please dispatch a team to inspect the affected street and verify meter connections.</li>
          <li><b>Recommended Checks:</b> Inspect complete street.</li>
        </ul>
        <p style="color:#555;">Stay proactive – early verification can help prevent major losses.</p>
        <p>Best Regards,<br><b>Admin</b></p>
      `;
    }

    else if (type === "fault") {
      subject = `⚙️ System Fault Alert – ${area}`;
      htmlMessage = `
        <h2 style="color:#ff9800;">⚙️ System Fault Detected</h2>
        <p>Dear Tech Team,</p>
        <p>The system has identified one or more meters as <strong>Offline or Faulty</strong> in the area <strong>${area}</strong>.</p>
        <p>This may indicate a communication failure, power outage, or sensor malfunction.</p>
        <ul>
          <li><b>Action Required:</b> Please check all devices in the affected area.</li>
          <li><b>Recommended Steps:</b> Verify power continuity, inspect wiring and sensors, and reset offline meters.</li>
        </ul>
        <p style="color:#555;">Keep the system in optimal health to ensure accurate readings.</p>
        <p>Best Regards,<br><b>Admin</b></p>
      `;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email type" });
    }

     await resend.emails.send({
      from: "Smart Power System <onboarding@resend.dev>",
      to: [process.env.ALERT_RECEIVER],
      subject: subject,
      html: htmlMessage,
    });

    console.log(`📨 Email sent successfully for ${type.toUpperCase()} in ${area}`);
    res.json({
      success: true,
      message: "Email sent successfully"
    });

  } catch (error) {
    console.error("❌ Email sending failed:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Email sending failed"
    });
  }
});

module.exports = router;