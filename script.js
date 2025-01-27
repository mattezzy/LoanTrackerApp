document.addEventListener('DOMContentLoaded', function () {
    // Sample loan data
    let loans = [
        {
            id: 1,
            title: "LANDBANK",
            loanAmount: 311000,
            payments: [
                { dueDate: "January 25, 2025", amount: 9838.02 },
                { dueDate: "February 25, 2025", amount: 9838.02 },
                { dueDate: "March 25, 2025", amount: 9838.02 }
            ]
        },
        {
            id: 2,
            title: "Personal Loan",
            loanAmount: 50000,
            payments: []
        }
    ];
    let currentLoanIndex = 0;

    // DOM Elements
    const loanContainer = document.querySelector('.container');
    const titleElement = document.getElementById('title');
    const loanAmountDisplay = document.getElementById('loanAmountDisplay');
    const loanAmountInput = document.getElementById('loanAmountInput');
    const totalMonthlyPaidElement = document.getElementById('totalMonthlyPaid');
    const outstandingBalanceElement = document.getElementById('outstandingBalance');
    const addPaymentButton = document.getElementById('addPayment');
    const tableBody = document.querySelector('table tbody');
    const themeToggle = document.getElementById('themeToggle');
    const monthlyPaymentInput = document.getElementById('monthlyPaymentInput');
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');
    const addLoanButton = document.getElementById('addLoan');
    const loanCountElement = document.getElementById('loanCount');

    const ctx = document.getElementById('doughnutChart').getContext('2d');
    let doughnutChart;

    // Initialize Chart
    function initializeChart() {
        doughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'Loan Payment',
                    data: [0, 100],
                    backgroundColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(75, 192, 192, 0.1)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(75, 192, 192, 0.1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '59%',
                rotation: 0,
                circumference: 360,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        enabled: true
                    }
                }
            }
        });
    }

    // Update Chart
    function updateChart(paidPercentage) {
        const remainingPercentage = 100 - paidPercentage;
        doughnutChart.data.datasets[0].data = [paidPercentage, remainingPercentage];
        doughnutChart.update();
        document.getElementById('chartPercentage').textContent = `${paidPercentage}%`;
    }

    // Theme Toggle
    themeToggle.addEventListener('click', function () {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        themeToggle.textContent = isDark ? '🌙' : '☀️';
        updateChartColors();
    });

    // Update Chart Colors Based on Theme
    function updateChartColors() {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        doughnutChart.data.datasets[0].backgroundColor = [
            isDark ? 'rgba(100, 210, 255, 1)' : 'rgba(75, 192, 192, 1)',
            isDark ? 'rgba(100, 210, 255, 0.1)' : 'rgba(75, 192, 192, 0.1)'
        ];
        doughnutChart.data.datasets[0].borderColor = [
            isDark ? 'rgba(100, 210, 255, 1)' : 'rgba(75, 192, 192, 1)',
            isDark ? 'rgba(100, 210, 255, 0.1)' : 'rgba(75, 192, 192, 0.1)'
        ];
        doughnutChart.update();
    }

    // Swipe Functionality
    let startX, startY, endX, endY;

    loanContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });

    loanContainer.addEventListener('touchmove', (e) => {
        endX = e.touches[0].clientX;
        endY = e.touches[0].clientY;
    });

    loanContainer.addEventListener('touchend', handleSwipe);

    loanContainer.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startY = e.clientY;
    });

    loanContainer.addEventListener('mousemove', (e) => {
        endX = e.clientX;
        endY = e.clientY;
    });

    loanContainer.addEventListener('mouseup', handleSwipe);

    function handleSwipe() {
        const deltaX = endX - startX;
        const deltaY = endY - startY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 50) {
                showPreviousLoan();
            } else if (deltaX < -50) {
                showNextLoan();
            }
        }
    }

    // Arrow Click Functionality
    leftArrow.addEventListener('click', showPreviousLoan);
    rightArrow.addEventListener('click', showNextLoan);

    function showNextLoan() {
        loanContainer.classList.add('swipe-left');
        setTimeout(() => {
            loanContainer.classList.remove('swipe-left');
            currentLoanIndex = (currentLoanIndex + 1) % loans.length;
            updateUIForCurrentLoan();
            updateLoanCount();
        }, 300);
    }

    function showPreviousLoan() {
        loanContainer.classList.add('swipe-right');
        setTimeout(() => {
            loanContainer.classList.remove('swipe-right');
            currentLoanIndex = (currentLoanIndex - 1 + loans.length) % loans.length;
            updateUIForCurrentLoan();
            updateLoanCount();
        }, 300);
    }

    // Update UI for Current Loan
    function updateUIForCurrentLoan() {
        const currentLoan = loans[currentLoanIndex];
        titleElement.textContent = currentLoan.title;
        loanAmountDisplay.textContent = `₱${formatCurrency(currentLoan.loanAmount)}`;
        monthlyPaymentInput.value = `₱${formatCurrency(currentLoan.payments.length > 0 ? currentLoan.payments[0].amount : 0)}`;
        updatePaymentTable(currentLoan.payments);
        updateSummaryAndChart();
    }

    // Update Payment Table
    function updatePaymentTable(payments) {
        tableBody.innerHTML = '';
        payments.forEach((payment, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td class="editable">${payment.dueDate}</td>
                <td class="editable">₱${formatCurrency(payment.amount)}</td>
                <td><button class="removePayment">-</button></td>
            `;
            tableBody.appendChild(row);
        });
        makeTableEditable();
    }

    // Make Table Editable
    function makeTableEditable() {
        document.querySelectorAll('table td.editable').forEach(cell => {
            if (cell.cellIndex === 1) {
                makeDateEditable(cell);
            } else if (cell.cellIndex === 2) {
                makeAmountEditable(cell);
            }
        });
    }

    // Make Date Editable
    function makeDateEditable(cell) {
        cell.addEventListener('click', function () {
            const input = document.createElement('input');
            input.type = 'date';
            input.value = new Date(cell.textContent).toISOString().split('T')[0];
            input.classList.add('edit-input');
            cell.textContent = '';
            cell.appendChild(input);
            input.focus();

            input.addEventListener('blur', function () {
                const newDate = new Date(input.value);
                if (!isNaN(newDate.getTime())) {
                    cell.textContent = formatDate(newDate);
                    updateLoanPayments();
                }
            });

            input.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    const newDate = new Date(input.value);
                    if (!isNaN(newDate.getTime())) {
                        cell.textContent = formatDate(newDate);
                        updateLoanPayments();
                    }
                }
            });
        });
    }

    // Make Amount Editable
    function makeAmountEditable(cell) {
        cell.addEventListener('click', function () {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = sanitizeAmountInput(cell.textContent).toFixed(2);
            input.classList.add('edit-input');
            cell.textContent = '';
            cell.appendChild(input);
            input.focus();

            input.addEventListener('blur', function () {
                const newAmount = sanitizeAmountInput(input.value);
                cell.textContent = `₱${formatCurrency(newAmount)}`;
                updateLoanPayments();
            });

            input.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    const newAmount = sanitizeAmountInput(input.value);
                    cell.textContent = `₱${formatCurrency(newAmount)}`;
                    updateLoanPayments();
                }
            });
        });
    }

    // Update Loan Payments
    function updateLoanPayments() {
        const currentLoan = loans[currentLoanIndex];
        currentLoan.payments = Array.from(tableBody.children).map(row => ({
            dueDate: row.children[1].textContent,
            amount: sanitizeAmountInput(row.children[2].textContent)
        }));
        updateSummaryAndChart();
    }

    // Update Summary and Chart
    function updateSummaryAndChart() {
        const currentLoan = loans[currentLoanIndex];
        const totalPaid = currentLoan.payments.reduce((sum, payment) => sum + payment.amount, 0);
        const paidPercentage = ((totalPaid / currentLoan.loanAmount) * 100).toFixed(0);

        totalMonthlyPaidElement.textContent = `₱${formatCurrency(totalPaid)}`;
        outstandingBalanceElement.textContent = `₱${formatCurrency(currentLoan.loanAmount - totalPaid)}`;
        updateChart(paidPercentage);
    }

    // Add Payment
    addPaymentButton.addEventListener('click', function () {
        const currentLoan = loans[currentLoanIndex];
        const monthlyPayment = sanitizeAmountInput(monthlyPaymentInput.value);
        const newPayment = { dueDate: formatDate(new Date()), amount: monthlyPayment };
        currentLoan.payments.unshift(newPayment);
        updateUIForCurrentLoan();
    });

    // Remove Payment
    tableBody.addEventListener('click', function (e) {
        if (e.target.classList.contains('removePayment')) {
            const row = e.target.closest('tr');
            if (row) {
                const currentLoan = loans[currentLoanIndex];
                const rowIndex = Array.from(tableBody.children).indexOf(row);
                currentLoan.payments.splice(rowIndex, 1);
                updateUIForCurrentLoan();
            }
        }
    });

    // Add New Loan
    addLoanButton.addEventListener('click', function () {
        const newLoan = {
            id: loans.length + 1,
            title: `New Loan ${loans.length + 1}`,
            loanAmount: 0,
            payments: []
        };
        loans.push(newLoan);
        currentLoanIndex = loans.length - 1;
        updateUIForCurrentLoan();
        updateLoanCount();
        updateChart(0); // Set graph to 0% for new loans
    });

    // Update Loan Count
    function updateLoanCount() {
        loanCountElement.textContent = currentLoanIndex + 1;
    }

    // Make Title Editable
    titleElement.addEventListener('click', function () {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = titleElement.textContent;
        input.classList.add('edit-input');
        titleElement.textContent = '';
        titleElement.appendChild(input);
        input.focus();

        input.addEventListener('blur', function () {
            const newTitle = input.value.trim();
            if (newTitle) {
                titleElement.textContent = newTitle;
                loans[currentLoanIndex].title = newTitle;
            }
        });

        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const newTitle = input.value.trim();
                if (newTitle) {
                    titleElement.textContent = newTitle;
                    loans[currentLoanIndex].title = newTitle;
                }
            }
        });
    });

    // Make Loan Amount Editable
    loanAmountDisplay.addEventListener('click', function () {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = sanitizeAmountInput(loanAmountDisplay.textContent).toFixed(2);
        input.classList.add('edit-input');
        loanAmountDisplay.textContent = '';
        loanAmountDisplay.appendChild(input);
        input.focus();

        input.addEventListener('blur', function () {
            const newAmount = sanitizeAmountInput(input.value);
            loanAmountDisplay.textContent = `₱${formatCurrency(newAmount)}`;
            loans[currentLoanIndex].loanAmount = newAmount;
            updateSummaryAndChart();
        });

        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const newAmount = sanitizeAmountInput(input.value);
                loanAmountDisplay.textContent = `₱${formatCurrency(newAmount)}`;
                loans[currentLoanIndex].loanAmount = newAmount;
                updateSummaryAndChart();
            }
        });
    });

    // Helper Functions
    function formatDate(date) {
        return date.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    function formatCurrency(amount) {
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function sanitizeAmountInput(input) {
        return parseFloat(input.replace(/[^0-9.-]+/g, '')) || 0;
    }

    // Initialize App
    initializeChart();
    updateUIForCurrentLoan();
    updateLoanCount();
});