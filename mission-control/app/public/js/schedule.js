/**
 * Schedule Manager - Displays all cron jobs and scheduled tasks
 */
class ScheduleManager {
  constructor() {
    this.jobs = {
      recurring: [
        {
          id: 'kanban-monitor',
          name: 'Kanban Server Monitor',
          schedule: 'Every 5 minutes',
          type: 'systemEvent',
          action: 'Monitor kanban-server-v3.py',
          cost: '$0'
        },
        {
          id: 'lust-rentals-monitor',
          name: 'Lust Rentals Monitor',
          schedule: 'Every 1 hour',
          type: 'agentTurn (Ollama)',
          action: 'Check app status; restart if down',
          cost: '$0'
        },
        {
          id: 'water-heater',
          name: 'Water Heater Monitor',
          schedule: 'Every 4 hours',
          type: 'agentTurn (Haiku)',
          action: 'Check temp; alert if <120°F',
          cost: '$0.0008/run'
        },
        {
          id: 'hourly-updates',
          name: 'Hourly Status Updates (4x)',
          schedule: '9:30, 10:30, 11:30, 12:30 AM EST',
          type: 'agentTurn (Haiku)',
          action: 'Send Telegram status updates',
          cost: '$0.008/run'
        }
      ],
      daily: [
        {
          name: 'Daily System Review',
          time: '8:00 AM EST',
          type: 'agentTurn (Ollama)',
          action: 'Review workspace for cleanup',
          cost: '$0'
        },
        {
          name: 'Daily Newark Report',
          time: '9:00 AM EST',
          type: 'agentTurn (Ollama)',
          action: 'Check security + temperature',
          cost: '$0'
        },
        {
          name: 'Daily Camera Report',
          time: '9:00 AM EST',
          type: 'agentTurn (Ollama)',
          action: 'Capture + send snapshots',
          cost: '$0'
        }
      ],
      market: [
        {
          name: 'Market Close Summary',
          schedule: '4:00 PM EST (Mon-Fri)',
          type: 'systemEvent',
          action: 'S&P 500, Dow, Nasdaq; daily summary',
          cost: '$0'
        },
        {
          name: 'Enhanced Investment Report',
          schedule: '4:00 PM EST (Mon-Fri)',
          type: 'agentTurn (Ollama/Haiku)',
          action: 'Technical + Sentiment + Earnings + Portfolio',
          cost: '$0.002/run'
        }
      ]
    };
  }

  init() {
    console.log('📅 Schedule Manager initialized');
    this.render();
  }

  render() {
    this.renderRecurring();
    this.renderDaily();
    this.renderMarket();
    this.renderCosts();
  }

  renderRecurring() {
    const container = document.querySelector('[data-panel="schedule-recurring"]');
    if (!container) return;

    let html = '';
    this.jobs.recurring.forEach(job => {
      html += `
        <div class="schedule-item">
          <div class="schedule-header">
            <span class="schedule-name">${job.name}</span>
            <span class="schedule-cost">${job.cost}</span>
          </div>
          <div class="schedule-details">
            <span class="schedule-time">⏰ ${job.schedule}</span>
            <span class="schedule-type">${job.type}</span>
          </div>
          <div class="schedule-action">${job.action}</div>
        </div>`;
    });

    container.innerHTML = html;
  }

  renderDaily() {
    const container = document.querySelector('[data-panel="schedule-daily"]');
    if (!container) return;

    let html = '';
    this.jobs.daily.forEach(job => {
      html += `
        <div class="schedule-item">
          <div class="schedule-header">
            <span class="schedule-name">${job.name}</span>
            <span class="schedule-cost">${job.cost}</span>
          </div>
          <div class="schedule-details">
            <span class="schedule-time">🕐 ${job.time}</span>
            <span class="schedule-type">${job.type}</span>
          </div>
          <div class="schedule-action">${job.action}</div>
        </div>`;
    });

    container.innerHTML = html;
  }

  renderMarket() {
    const container = document.querySelector('[data-panel="schedule-market"]');
    if (!container) return;

    let html = '';
    this.jobs.market.forEach(job => {
      html += `
        <div class="schedule-item">
          <div class="schedule-header">
            <span class="schedule-name">${job.name}</span>
            <span class="schedule-cost">${job.cost}</span>
          </div>
          <div class="schedule-details">
            <span class="schedule-time">📈 ${job.schedule}</span>
            <span class="schedule-type">${job.type}</span>
          </div>
          <div class="schedule-action">${job.action}</div>
        </div>`;
    });

    container.innerHTML = html;
  }

  renderCosts() {
    const container = document.querySelector('[data-panel="schedule-costs"]');
    if (!container) return;

    const costData = `
      <table style="width: 100%; border-collapse: collapse; color: var(--text);">
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); padding: 10px 0;">
          <th style="text-align: left; padding: 8px;">Job</th>
          <th style="text-align: center; padding: 8px;">Frequency</th>
          <th style="text-align: right; padding: 8px;">Monthly Cost</th>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 8px;">Water Heater Monitor</td>
          <td style="text-align: center; padding: 8px; font-size: 13px;">4 hrs</td>
          <td style="text-align: right; padding: 8px; color: var(--accent);">~$0.14</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 8px;">Hourly Updates (4x)</td>
          <td style="text-align: center; padding: 8px; font-size: 13px;">1 hr</td>
          <td style="text-align: right; padding: 8px; color: var(--accent);">~$23.00</td>
        </tr>
        <tr style="background: rgba(255,255,255,0.05); border-radius: 4px;">
          <td style="padding: 8px; font-weight: bold;">Total Monthly</td>
          <td style="text-align: center; padding: 8px;"></td>
          <td style="text-align: right; padding: 8px; color: var(--accent); font-weight: bold;">~$23.14</td>
        </tr>
      </table>
      <p style="margin-top: 12px; font-size: 13px; color: #9fb0d6;">
        All Ollama jobs are <strong>free</strong> (local execution). Haiku is ~$0.0008/run with caching.
      </p>`;

    container.innerHTML = costData;
  }
}

// Initialize on page load
window.ScheduleManager = ScheduleManager;
window.scheduleManager = null;

document.addEventListener('DOMContentLoaded', () => {
  window.scheduleManager = new ScheduleManager();
  window.scheduleManager.init();
  console.log('✅ Schedule Manager loaded');
});
