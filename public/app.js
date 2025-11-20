// public/app.js
const urlInput = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const genResult = document.getElementById('genResult');
const msg = document.getElementById('msg');
const shortUrlA = document.getElementById('shortUrl');
const statusSpan = document.getElementById('status');
const tbody = document.getElementById('urlTableBody');

async function loadUrls() {
  tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
  try {
    const res = await fetch('/api/urls');
    const data = await res.json();
    tbody.innerHTML = '';
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="5">No URLs yet</td></tr>';
      return;
    }
    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><a href="/${row.slug}" target="_blank">${row.slug}</a></td>
        <td class="long-url"><a href="${row.target_url}" target="_blank">${row.target_url}</a></td>
        <td>${row.health_status === 'good' ? '🟢 GOOD' : '🔴 BAD'}</td>
        <td>${row.click_count}</td>
        <td>
          <button class="btn" data-slug="${row.slug}">Stats</button>
          <button class="btn-red" data-id="${row.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5">Failed to load</td></tr>';
  }
}

async function shortenUrl() {
  const url = urlInput.value.trim();
  msg.textContent = '';
  genResult.classList.add('hidden');

  if (!url) {
    msg.textContent = 'Please enter a URL.';
    return;
  }

  try {
    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (!res.ok) {
      msg.textContent = data.error || 'Failed to create';
      return;
    }
    shortUrlA.href = data.shortUrl;
    shortUrlA.textContent = data.shortUrl;
    statusSpan.textContent = data.health_status === 'good' ? '🟢 GOOD' : '🔴 BAD';
    genResult.classList.remove('hidden');
    urlInput.value = '';
    loadUrls();
  } catch (err) {
    msg.textContent = 'Network error';
    console.error(err);
  }
}

shortenBtn.addEventListener('click', shortenUrl);
urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') shortenUrl(); });

// delegate buttons in table
tbody.addEventListener('click', async (e) => {
  if (e.target.matches('.btn')) {
    const slug = e.target.dataset.slug;
    window.location.href = `/code/${slug}`;
  } else if (e.target.matches('.btn-red')) {
    const id = e.target.dataset.id;
    if (!confirm('Delete this short URL?')) return;
    try {
      await fetch(`/api/url/${id}`, { method: 'DELETE' });
      loadUrls();
    } catch (err) {
      alert('Delete failed');
    }
  }
});

window.addEventListener('load', loadUrls);
