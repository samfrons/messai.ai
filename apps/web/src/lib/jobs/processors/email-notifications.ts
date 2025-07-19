import { Job } from 'bullmq';
import { EmailNotificationJobData, JobResult } from '../types';

// Email templates
const emailTemplates = {
  welcome: {
    subject: 'Welcome to MESSAI!',
    html: (data: any) => `
      <h1>Welcome to MESSAI, ${data.name}!</h1>
      <p>We're excited to have you join our community of researchers and innovators.</p>
      <p>Get started by:</p>
      <ul>
        <li>Exploring our research paper library</li>
        <li>Setting up your first experiment</li>
        <li>Configuring your system parameters</li>
      </ul>
      <p>If you have any questions, don't hesitate to reach out!</p>
    `,
  },
  experiment_complete: {
    subject: 'Your experiment has completed',
    html: (data: any) => `
      <h1>Experiment Complete!</h1>
      <p>Your experiment "${data.experimentName}" has finished processing.</p>
      <p><strong>Status:</strong> ${data.status}</p>
      <p><strong>Duration:</strong> ${data.duration}</p>
      <p><strong>Key Results:</strong></p>
      <ul>
        ${
          data.results?.map((r: string) => `<li>${r}</li>`).join('') ||
          '<li>No results available</li>'
        }
      </ul>
      <p><a href="${data.link}">View Full Results</a></p>
    `,
  },
  paper_processed: {
    subject: 'Paper processing complete',
    html: (data: any) => `
      <h1>Paper Processing Complete</h1>
      <p>The paper "${data.paperTitle}" has been processed successfully.</p>
      <p><strong>Extracted Parameters:</strong> ${data.parameterCount}</p>
      <p><strong>AI Confidence:</strong> ${(data.confidence * 100).toFixed(1)}%</p>
      <p><strong>Key Findings:</strong></p>
      <ul>
        ${
          data.findings?.map((f: string) => `<li>${f}</li>`).join('') ||
          '<li>No findings extracted</li>'
        }
      </ul>
      <p><a href="${data.link}">View Paper Details</a></p>
    `,
  },
  error_notification: {
    subject: 'Error in MESSAI Processing',
    html: (data: any) => `
      <h1>Processing Error</h1>
      <p>An error occurred while processing your request.</p>
      <p><strong>Task:</strong> ${data.taskType}</p>
      <p><strong>Error:</strong> ${data.error}</p>
      <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
      <p>Our team has been notified and is working on resolving this issue.</p>
      ${data.retryable ? '<p>The task will be automatically retried.</p>' : ''}
    `,
  },
};

export async function processEmailJob(job: Job<EmailNotificationJobData>): Promise<JobResult> {
  const { to, subject: customSubject, template, data, priority } = job.data;
  const startTime = Date.now();

  try {
    await job.updateProgress({ percentage: 10, message: 'Preparing email...' });

    // Get template
    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) {
      throw new Error(`Unknown email template: ${template}`);
    }

    // Prepare email content
    const recipients = Array.isArray(to) ? to : [to];
    const subject = customSubject || emailTemplate.subject;
    const html = emailTemplate.html(data);

    await job.updateProgress({ percentage: 30, message: 'Sending email...' });

    // TODO: Implement actual email sending
    // This would involve:
    // 1. Using an email service (SendGrid, AWS SES, etc.)
    // 2. Handling bounce backs and failures
    // 3. Tracking delivery status

    // Mock email sending
    const emailResults = await Promise.all(
      recipients.map(async (recipient) => {
        // Simulate email sending delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock success/failure (95% success rate)
        const success = Math.random() > 0.05;

        return {
          recipient,
          success,
          messageId: success
            ? `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            : undefined,
          error: success ? undefined : 'Mock delivery failure',
        };
      })
    );

    await job.updateProgress({ percentage: 80, message: 'Verifying delivery...' });

    // Check results
    const successCount = emailResults.filter((r) => r.success).length;
    const failureCount = emailResults.filter((r) => !r.success).length;

    // Log email sending
    await job.log(`Email sent to ${successCount} recipients, ${failureCount} failed`);

    // Store email log (in production, this would go to a proper email log table)
    const emailLog = {
      template,
      subject,
      recipients,
      data,
      results: emailResults,
      sentAt: new Date(),
      priority,
    };

    await job.updateProgress({ percentage: 100, message: 'Email sent successfully!' });

    return {
      success: failureCount === 0,
      data: {
        sent: successCount,
        failed: failureCount,
        results: emailResults,
        log: emailLog,
      },
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Email job failed:', error);
    throw error;
  }
}

// Helper function to send email with retry logic outside of job queue
export async function sendEmailWithRetry(
  to: string | string[],
  template: EmailNotificationJobData['template'],
  data: Record<string, any>,
  options?: {
    priority?: EmailNotificationJobData['priority'];
    maxRetries?: number;
    retryDelay?: number;
  }
): Promise<boolean> {
  const maxRetries = options?.maxRetries || 3;
  const retryDelay = options?.retryDelay || 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // TODO: Implement actual email sending logic
      // This is where you'd integrate with your email service

      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Simulate occasional failures
      if (Math.random() > 0.9 && attempt < maxRetries) {
        throw new Error('Temporary email service failure');
      }

      return true;
    } catch (error) {
      console.error(`Email send attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
      } else {
        throw error;
      }
    }
  }

  return false;
}
