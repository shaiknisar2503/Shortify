// public/code.js
const infoBox = document.getElementById('infoBox');
const clicksBody = document.getElementById('clicksBody');

const slug = window.location.pathname.split('/').pop();

async function loadStats() {
  infoBox.innerHTML = 'Loading...';
  try {
    const res = await fetch(`/api/info/${slug}`);
    const data = await res.json();
    if (!res.ok && data.error) {
      infoBox.innerHTML = `<p>Error: ${data.error}</p>`;
      return;
    }

    infoBox.innerHTML = `
      <p><strong>Slug:</strong> ${data.slug}</p>
      <p><strong>Original URL:</strong> <a href="${data.target_url}" target="_blank">${data.target_url}</a></p>
      <p><strong>Health:</strong> ${data.health_status === 'good' ? '🟢 GOOD' : '🔴 BAD'}</p>
      <p><strong>Total Clicks:</strong> ${data.click_count}</p>
      <p><strong>Created At:</strong> ${data.created_at}</p>
    `;

    clicksBody.innerHTML = '';
    if (!data.clicks || !data.clicks.length) {
      clicksBody.innerHTML = '<tr><td colspan="4">No clicks yet</td></tr>';
      return;
    }

    data.clicks.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.timestamp}</td>
        <td>${c.ip}</td>
        <td class="ua">${c.user_agent}</td>
        <td>${c.referrer || '-'}</td>
      `;
      clicksBody.appendChild(tr);
    });
  } catch (err) {
    infoBox.innerHTML = '<p>Failed to load stats</p>';
  }
}

loadStats();
