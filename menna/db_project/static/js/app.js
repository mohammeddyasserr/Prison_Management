/**
 * CPMS — Client-side JavaScript
 * Chart rendering for dashboards using Chart.js (loaded from CDN in base.html)
 */

// Helper: get occupancy color class per PRD 9.1
function getOccupancyColor(rate) {
    if (rate > 90) return 'red';
    if (rate >= 75) return 'amber';
    return 'green';
}

// Helper: get occupancy CSS color
function getOccupancyCSS(rate) {
    if (rate > 90) return '#ef4444';
    if (rate >= 75) return '#f59e0b';
    return '#22c55e';
}

// Render a bar chart for "Total Prisoners per Prison" (PRD 9.1)
function renderPrisonBarChart(canvasId, prisons) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !prisons.length) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: prisons.map(p => p.name),
            datasets: [{
                label: 'Current Inmates',
                data: prisons.map(p => p.current_occupancy),
                backgroundColor: prisons.map(p => getOccupancyCSS(
                    p.total_capacity > 0 ? (p.current_occupancy / p.total_capacity * 100) : 0
                )),
                borderRadius: 6,
                barPercentage: 0.6
            }, {
                label: 'Total Capacity',
                data: prisons.map(p => p.total_capacity),
                backgroundColor: 'rgba(148, 163, 184, 0.2)',
                borderRadius: 6,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#94a3b8', font: { size: 12 } }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(42,53,80,0.5)' }
                },
                y: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(42,53,80,0.5)' }
                }
            }
        }
    });
}

// Render transfer statistics doughnut chart (PRD 9.1)
function renderTransferChart(canvasId, pending, approved, denied) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pending', 'Approved', 'Denied'],
            datasets: [{
                data: [pending, approved, denied],
                backgroundColor: ['#f59e0b', '#22c55e', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { size: 12 }, padding: 16 }
                }
            }
        }
    });
}

// Render overcrowding forecast chart (PRD 8.2)
function renderOvercrowdingChart(canvasId, forecasts) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !forecasts.length) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: forecasts.map(f => f.name),
            datasets: [
                {
                    label: 'Current',
                    data: forecasts.map(f => f.current_rate),
                    backgroundColor: '#3b82f6',
                    borderRadius: 4, barPercentage: 0.7
                },
                {
                    label: '30 Days',
                    data: forecasts.map(f => f.forecast_30),
                    backgroundColor: '#f59e0b',
                    borderRadius: 4, barPercentage: 0.7
                },
                {
                    label: '90 Days',
                    data: forecasts.map(f => f.forecast_90),
                    backgroundColor: '#ef4444',
                    borderRadius: 4, barPercentage: 0.7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#94a3b8' }
                }
            },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(42,53,80,0.5)' } },
                y: {
                    ticks: { color: '#94a3b8', callback: v => v + '%' },
                    grid: { color: 'rgba(42,53,80,0.5)' },
                    suggestedMax: 100
                }
            }
        }
    });
}
