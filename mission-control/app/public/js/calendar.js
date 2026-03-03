/**
 * Calendar Manager - Professional calendar view of all scheduled jobs
 */
class CalendarManager {
  constructor() {
    this.jobs = [
      // Recurring (throughout week)
      {
        name: 'Kanban Monitor',
        time: 'Every 5 min',
        type: 'system',
        cost: '$0',
        days: [0, 1, 2, 3, 4, 5, 6], // All days
        icon: '⚙️'
      },
      {
        name: 'Lust Rentals Check',
        time: 'Every 1 hr',
        type: 'ollama',
        cost: '$0',
        days: [0, 1, 2, 3, 4, 5, 6],
        icon: '💼'
      },
      {
        name: 'Water Heater Monitor',
        time: 'Every 4 hrs',
        type: 'haiku',
        cost: '$0.0008',
        days: [0, 1, 2, 3, 4, 5, 6],
        icon: '🌡️'
      },
      // Daily - Morning
      {
        name: 'System Review',
        time: '8:00 AM',
        type: 'ollama',
        cost: '$0',
        days: [0, 1, 2, 3, 4, 5, 6],
        icon: '📋'
      },
      {
        name: 'Newark Report',
        time: '9:00 AM',
        type: 'ollama',
        cost: '$0',
        days: [0, 1, 2, 3, 4, 5, 6],
        icon: '🏠'
      },
      {
        name: 'Camera Snapshots',
        time: '9:00 AM',
        type: 'ollama',
        cost: '$0',
        days: [0, 1, 2, 3, 4, 5, 6],
        icon: '📸'
      },
      // Hourly - Afternoon
      {
        name: 'Hourly Updates',
        time: '9:30, 10:30, 11:30, 12:30 PM',
        type: 'haiku',
        cost: '$0.008',
        days: [0, 1, 2, 3, 4, 5, 6],
        icon: '📲'
      },
      // Market - Weekdays only
      {
        name: 'Market Close',
        time: '4:00 PM',
        type: 'system',
        cost: '$0',
        days: [1, 2, 3, 4, 5], // Mon-Fri
        icon: '📈'
      },
      {
        name: 'Investment Report',
        time: '4:00 PM',
        type: 'haiku',
        cost: '$0.002',
        days: [1, 2, 3, 4, 5],
        icon: '💰'
      }
    ];

    this.dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }

  init() {
    console.log('📅 Calendar Manager initialized');
    this.render();
  }

  render() {
    const container = document.querySelector('[data-panel="calendar"]');
    if (!container) return;

    let html = '<div class="calendar-grid">';

    // Header - Days of week
    html += '<div class="calendar-header">';
    this.dayNames.forEach(day => {
      html += `<div class="calendar-day-header">${day}</div>`;
    });
    html += '</div>';

    // Calendar rows - one row per day
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      html += `<div class="calendar-day" data-day="${dayIndex}">
        <div class="calendar-day-title">${this.dayNames[dayIndex]}</div>
        <div class="calendar-day-jobs">`;

      // Get jobs for this day
      this.jobs
        .filter(job => job.days.includes(dayIndex))
        .forEach(job => {
          const typeClass = `job-${job.type}`;
          html += `
            <div class="calendar-job ${typeClass}" title="${job.name}">
              <span class="job-icon">${job.icon}</span>
              <span class="job-name">${job.name}</span>
              <span class="job-time">${job.time}</span>
              <span class="job-cost">${job.cost}</span>
            </div>`;
        });

      html += '</div></div>';
    }

    html += '</div>';

    // Add legend
    html += `
      <div class="calendar-legend">
        <div class="legend-item">
          <span class="legend-dot job-system"></span>
          <span>System Event</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot job-ollama"></span>
          <span>Ollama (Free)</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot job-haiku"></span>
          <span>Haiku (Paid)</span>
        </div>
      </div>`;

    container.innerHTML = html;
  }

  getTotalMonthlyCost() {
    // Water heater: 180 runs/month * $0.0008 = $0.14
    // Hourly updates: 2880 runs/month * $0.008 = $23
    return '$23.14';
  }
}

// Initialize on page load
window.CalendarManager = CalendarManager;
window.calendarManager = null;

document.addEventListener('DOMContentLoaded', () => {
  window.calendarManager = new CalendarManager();
  window.calendarManager.init();
  console.log('✅ Calendar Manager loaded');
});
