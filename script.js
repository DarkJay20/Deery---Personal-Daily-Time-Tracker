// --- GLOBAL VARIABLES ---
let logs = []; // Array to hold all log objects
let settings = {}; // Object to hold all app settings
let monthlyData = {}; // Object to hold monthly specific data (e.g. actual pay)

const DB_KEY = 'dtrAppLogs';
const SETTINGS_KEY = 'dtrAppSettings';
const MONTHLY_DATA_KEY = 'dtrAppMonthlyData';
const USERNAME_KEY = 'dtrAppUsername'; // New Username Key
let currentUsername = '';

// --- DOM ELEMENTS ---
const pages = document.querySelectorAll('main');
const navLinks = document.querySelectorAll('.nav-link');
const bottomNav = document.getElementById('bottom-nav');
const notificationClearedIndicator = document.getElementById('notification-cleared-indicator');
const clearNotificationsBtn = document.getElementById('clear-notifications-btn');

// Header & Notifications
const notificationBtn = document.getElementById('nav-notification-btn');
const notificationBadge = document.getElementById('notification-badge');
const notificationPanel = document.getElementById('notification-panel');
const notificationOverlay = document.getElementById('notification-overlay');
const closeNotificationsBtn = document.getElementById('close-notifications-btn');
const notificationList = document.getElementById('notification-list');

// Onboarding Elements
const pageOnboarding = document.getElementById('page-onboarding');
const onboardingForm = document.getElementById('onboarding-form');
const onboardingNameInput = document.getElementById('onboarding-name');

// Avatar Elements
const mainDeeryImg = document.getElementById('main-deery-img');
const headerDeeryImg = document.getElementById('header-deery-img');

// Modal elements
const modalBackdrop = document.getElementById('modal-backdrop');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
let modalConfirmCallback = null;

// Page: Home (Quick Log)
const quickLogContainer = document.getElementById('quick-log-container');
const quickLogCard = document.getElementById('quick-log-card'); 
const quickLogHeader = document.getElementById('quick-log-header'); // <--- Added this
const todaySalarySummary = document.getElementById('today-salary-summary');

// Live Clock Elements
const liveClock = document.getElementById('live-clock');
const liveGreeting = document.getElementById('live-greeting');
const liveDate = document.getElementById('live-date');

// Page: Editor
const editorForm = document.getElementById('log-editor-form');
const editorDate = document.getElementById('editor-date');
const editorNotes = document.getElementById('editor-notes');
const editorDeleteBtn = document.getElementById('editor-delete');

// Page: Editor (Bulk Apply)
const bulkApplyForm = document.getElementById('bulk-apply-form');
const bulkStartDate = document.getElementById('bulk-start-date');
const bulkEndDate = document.getElementById('bulk-end-date');
const bulkStatus = document.getElementById('bulk-status');

// Page: View Data
const logsTableBody = document.getElementById('logs-table-body');
const viewFilterMonth = document.getElementById('view-filter-month');
const viewFilterYear = document.getElementById('view-filter-year');
const importBtn = document.getElementById('import-button');
const importFileInput = document.getElementById('import-file-input');
const export15thBtn = document.getElementById('export-15th');
const exportMonthBtn = document.getElementById('export-month');
const exportAllBtn = document.getElementById('export-all');
const clearAllBtn = document.getElementById('clear-all-data');
const statsWorkDays = document.getElementById('stats-work-days');
const statsHours = document.getElementById('stats-hours');
const statsLates = document.getElementById('stats-lates');
const statsUndertimes = document.getElementById('stats-undertimes');
const statsAbsences = document.getElementById('stats-absences');
// Analytics Elements
const toggleDataViewBtn = document.getElementById('toggle-data-view');
const toggleAnalyticsViewBtn = document.getElementById('toggle-analytics-view');
const historyDataView = document.getElementById('history-data-view');
const historyAnalyticsView = document.getElementById('history-analytics-view');
let chartFinanceInst, chartHoursInst, chartAttendanceInst, chartPenaltiesInst;

// View Toggle Elements
const viewToggleTable = document.getElementById('view-toggle-table');
const viewToggleCalendar = document.getElementById('view-toggle-calendar');
const viewModeTable = document.getElementById('view-mode-table');
const viewModeCalendar = document.getElementById('view-mode-calendar');
const calendarGrid = document.getElementById('calendar-grid');

// Backup & Restore
const backupJsonBtn = document.getElementById('backup-json-btn');
const restoreJsonBtn = document.getElementById('restore-json-btn');
const restoreJsonInput = document.getElementById('restore-json-input');

// Page: Salary
const salaryToday = document.getElementById('salary-today');
const salaryTodayDeductions = document.getElementById('salary-today-deductions');
const salary15th = document.getElementById('salary-15th');
const salary15thSummary = document.getElementById('salary-15th-summary');
const salary16th = document.getElementById('salary-16th');             // <--- Add this
const salary16thSummary = document.getElementById('salary-16th-summary'); // <--- Add this
const salaryMonth = document.getElementById('salary-month');
const salaryMonthSummary = document.getElementById('salary-month-summary');
const salaryHistoryBody = document.getElementById('salary-history-body');

// Page: Settings
const settingsForm = document.getElementById('settings-form');
const settingUsername = document.getElementById('setting-username');
const settingTheme = document.getElementById('setting-theme');
const settingDailySalary = document.getElementById('setting-daily-salary');
const settingDeduction = document.getElementById('setting-deduction');
const settingMorningLate = document.getElementById('setting-morning-late');
const settingAfternoonLate = document.getElementById('setting-afternoon-late');
const settingMorningUndertime = document.getElementById('setting-morning-undertime');
const settingAfternoonUndertime = document.getElementById('setting-afternoon-undertime');
const settingUndertimeDeduction = document.getElementById('setting-undertime-deduction');
const settingQuickConfirm = document.getElementById('setting-quick-confirm');
const settingsSaveBtn = document.getElementById('settings-save-btn');


// --- HELPER FUNCTIONS ---

const getISODate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDateReadable = (dateString) => {
    if (!dateString) return "Invalid Date";
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    });
};

const formatTime12Hour = (timeStr) => {
    if (!timeStr || isTextEntry(timeStr)) return timeStr || '--';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12; // Converts 0 to 12 for Midnight
    return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};


const parseTime = (timeStr) => {
    if (!timeStr) return NaN;
    if (!/^\d{1,2}:\d{2}$/.test(timeStr)) {
        return NaN;
    }
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const isTextEntry = (value) => {
    return value && isNaN(parseTime(value));
};

const isWorkDay = (dateString) => {
    if (!dateString) return false;
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(y, m - 1, d); 
    const day = date.getDay(); 
    return day >= 1 && day <= 5;
};

const sortLogs = () => {
    logs.sort((a, b) => a.date.localeCompare(b.date));
};

const getLog = (date) => {
    return logs.find(log => log.date === date);
};

const createEmptyLog = (date) => ({
    date: date,
    morningIn: '',
    morningOut: '',
    afternoonIn: '',
    afternoonOut: '',
    notes: ''
});

// --- CORE DATA FUNCTIONS ---

const applyTheme = (theme) => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
};

const loadSettings = () => {
    const defaultSettings = {
        theme: 'light',
        dailySalary: 681.82,
        deductionPerMinute: 1, 
        morningLateThreshold: '08:00',
        afternoonLateThreshold: '13:00',
        morningUndertimeThreshold: '12:00', 
        afternoonUndertimeThreshold: '17:00', 
        undertimeDeductionPerMinute: 1,
        requireQuickLogConfirm: true,
        statuses: [
            { id: 'regular', name: 'Regular Work', isPaid: true, reqAM: true, reqPM: true },
            { id: 'wfh', name: 'Work From Home (WFH)', isPaid: true, reqAM: false, reqPM: false },
            { id: 'travel', name: 'Official Travel', isPaid: true, reqAM: false, reqPM: false },
            { id: 'vacation', name: 'Vacation Leave', isPaid: true, reqAM: false, reqPM: false },
            { id: 'sick', name: 'Sick Leave', isPaid: true, reqAM: false, reqPM: false },
            { id: 'holiday', name: 'Holiday (Paid)', isPaid: true, reqAM: false, reqPM: false },
            { id: 'absent', name: 'Absent', isPaid: false, reqAM: false, reqPM: false },
            { id: 'suspended', name: 'Suspended', isPaid: false, reqAM: false, reqPM: false },
            { id: 'halfday_am', name: 'Half Day (Morning)', isPaid: false, reqAM: true, reqPM: false },
            { id: 'halfday_pm', name: 'Half Day (Afternoon)', isPaid: false, reqAM: false, reqPM: true }
        ]
    };
    
    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    settings = storedSettings ? JSON.parse(storedSettings) : defaultSettings;
    settings = { ...defaultSettings, ...settings };

    // --- MIGRATION: Convert old 'requiresTime' format to the new granular AM/PM system ---
    if (settings.statuses) {
        settings.statuses = settings.statuses.map(s => {
            if (s.reqAM === undefined) {
                // If it's old data, upgrade it seamlessly
                if (s.id === 'halfday_am') return { ...s, reqAM: true, reqPM: false };
                if (s.id === 'halfday_pm') return { ...s, reqAM: false, reqPM: true };
                if (s.requiresTime) return { ...s, reqAM: true, reqPM: true };
                return { ...s, reqAM: false, reqPM: false };
            }
            return s;
        });
    }

    applyTheme(settings.theme);
    saveSettings(); 
};

const saveSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

const loadLogs = () => {
    const storedLogs = localStorage.getItem(DB_KEY);
    logs = storedLogs ? JSON.parse(storedLogs) : [];
    logs = logs.map(log => {
        // Data Migration: Upgrade old halfday tags to the new format
        if (log.status === 'halfday') log.status = 'halfday_am';
        return { ...createEmptyLog(log.date), ...log };
    });
    sortLogs();
};

const saveLogs = () => {
    sortLogs();
    localStorage.setItem(DB_KEY, JSON.stringify(logs));
};

const loadMonthlyData = () => {
    const storedData = localStorage.getItem(MONTHLY_DATA_KEY);
    monthlyData = storedData ? JSON.parse(storedData) : {};
};

const saveMonthlyData = () => {
    localStorage.setItem(MONTHLY_DATA_KEY, JSON.stringify(monthlyData));
};

const getOrCreateLog = (date) => {
    let log = getLog(date);
    if (!log) {
        log = createEmptyLog(date);
        logs.push(log);
        saveLogs();
    }
    return log;
};


// --- ONBOARDING & AVATAR LOGIC ---

const checkOnboarding = () => {
    const savedName = localStorage.getItem(USERNAME_KEY);
    
    if (!savedName) {
        // App UI hide
        pageOnboarding.classList.remove('hidden');
        if (bottomNav) bottomNav.classList.add('hidden');
        document.getElementById('main-container').classList.add('hidden');

        // Internal DOM Elements
        const skipBtn = document.getElementById('onboarding-skip');
        const nextBtn = document.getElementById('onboarding-next-btn');
        const dotsContainer = document.getElementById('onboarding-dots');
        const step1 = document.getElementById('onboarding-step-1');
        const step2 = document.getElementById('onboarding-step-2');
        const step3 = document.getElementById('onboarding-step-3');
        const introImg = document.getElementById('intro-img');
        const introTitle = document.getElementById('intro-title');
        const introDesc = document.getElementById('intro-desc');
        const nameInput = document.getElementById('onboarding-name');

        // Carousel Content Dictionary
        const introSlides = [
            { img: 'Expressions/Deery_welcome.png', title: 'Welcome to Deery', desc: 'Track your time and earnings in one place, automatically.' },
            { img: 'Expressions/Deery_tracking.png', title: 'Log with ease', desc: 'Quickly record your shifts. Deery calculates lates and undertimes for you.' },
            { img: 'Expressions/Deery_analytics.png', title: 'Powerful Insights', desc: 'View monthly history, monitor your attendance streak, and estimate your net pay.' }
        ];

        let currentSlide = 0;
        let currentStep = 1;

        const updateCarousel = () => {
            // 1. Smoothly fade out and push down/scale down
            introImg.classList.add('opacity-0', 'scale-90');
            introTitle.classList.add('opacity-0', 'translate-y-3');
            introDesc.classList.add('opacity-0', 'translate-y-3');

            setTimeout(() => {
                // 2. Swap the text while hidden
                introTitle.textContent = introSlides[currentSlide].title;
                introDesc.textContent = introSlides[currentSlide].desc;

                // 3. Swap the image, but WAIT for it to load before revealing
                introImg.src = introSlides[currentSlide].img;
                
                introImg.onload = () => {
                    // 4. Bring everything back in beautifully
                    introImg.classList.remove('opacity-0', 'scale-90');
                    introTitle.classList.remove('opacity-0', 'translate-y-3');
                    introDesc.classList.remove('opacity-0', 'translate-y-3');
                };
            }, 300); // Wait 300ms for the fade-out to finish before swapping

            // Update sliding dots indicator
            Array.from(dotsContainer.children).forEach((dot, idx) => {
                dot.className = idx === currentSlide 
                    ? 'w-4 h-2 rounded-full bg-primary-600 transition-all duration-300' 
                    : 'w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 transition-all duration-300';
            });

            nextBtn.textContent = currentSlide === introSlides.length - 1 ? "Let's get started" : "Next";
        };

        const slideToStep = (step) => {
            currentStep = step;
            
           // Slide 1 (Carousel)
            step1.className = `w-full flex flex-col items-center justify-center text-center transition-all duration-500 transform absolute inset-0 px-6 pb-24 ${step === 1 ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-full opacity-0 pointer-events-none'}`;
            
            // Slide 2 (Name)
            step2.className = `w-full flex flex-col items-center justify-center text-center transition-all duration-500 transform absolute inset-0 px-6 pb-24 ${step === 2 ? 'translate-x-0 opacity-100 pointer-events-auto' : (step < 2 ? 'translate-x-full opacity-0 pointer-events-none' : '-translate-x-full opacity-0 pointer-events-none')}`;
            // Slide 3 (Settings)
            step3.className = `w-full flex flex-col transition-all duration-500 transform absolute inset-0 pt-4 px-6 overflow-y-auto pb-32 no-scrollbar ${step === 3 ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none'}`;
            
            // UI Adjustments based on Step
            if (step === 2) {
                dotsContainer.classList.add('opacity-0');
                skipBtn.classList.add('opacity-0', 'pointer-events-none');
                nextBtn.textContent = "Continue";
                setTimeout(() => nameInput.focus(), 600); // Auto-focus keyboard
            } else if (step === 3) {
                nextBtn.textContent = "Finish Setup";
            }
        };

        // Handle Main Action Button
        nextBtn.addEventListener('click', () => {
            if (currentStep === 1) {
                if (currentSlide < introSlides.length - 1) {
                    currentSlide++;
                    updateCarousel();
                } else {
                    slideToStep(2);
                }
            } 
            else if (currentStep === 2) {
                if (!nameInput.value.trim()) {
                    showToast('Please enter what we should call you.', 'error');
                    nameInput.focus();
                    return;
                }
                slideToStep(3);
            } 
            else if (currentStep === 3) {
                // 1. Save Username
                const name = nameInput.value.trim();
                localStorage.setItem(USERNAME_KEY, name);
                currentUsername = name;

                // 2. Save Settings
                settings.dailySalary = parseFloat(document.getElementById('onboarding-salary').value) || 0;
                settings.deductionPerMinute = parseFloat(document.getElementById('onboarding-late-pen').value) || 0;
                settings.undertimeDeductionPerMinute = parseFloat(document.getElementById('onboarding-under-pen').value) || 0;
                settings.morningLateThreshold = document.getElementById('onboarding-time-in').value || '08:00';
                settings.afternoonUndertimeThreshold = document.getElementById('onboarding-time-out').value || '17:00';
                
                saveSettings();
                
                // 3. Exit Onboarding and Start App
                pageOnboarding.classList.add('opacity-0');
                setTimeout(() => {
                    pageOnboarding.classList.add('hidden');
                    if (bottomNav) bottomNav.classList.remove('hidden');
                    document.getElementById('main-container').classList.remove('hidden');
                    
                    updateLiveClock(); 
                    renderSettingsPage(); 
                    updateDeeryAvatar();
                    
                    setTimeout(() => triggerStartupGreeting(), 800); 
                }, 400);
            }
        });

        // Handle Skip Button
        skipBtn.addEventListener('click', () => slideToStep(2));

        // Start the engine
        updateCarousel();

    } else {
        // Normal Boot for Returning Users
        currentUsername = savedName;
        if (bottomNav) bottomNav.classList.remove('hidden');
        document.getElementById('main-container').classList.remove('hidden');
        setTimeout(() => triggerStartupGreeting(), 1500);
    }
};


// --- TEMPORARY AVATAR TESTER ---
window.testAvatar = (avatarName) => {
    const path = `Expressions/${avatarName}`;
    
    // Force the image source to change
    if (mainDeeryImg) mainDeeryImg.src = path;
    if (headerDeeryImg) headerDeeryImg.src = path;
    
    // Show a success message
    showToast(`Previewing: ${avatarName.replace('.png', '')}`, 'success');
    
    // Jump to the Home screen instantly so you can see it
    showPage('home');
};

const updateDeeryAvatar = () => {
    const now = new Date();
    // Use the console's test hour if it exists, otherwise use the real time!
    const hour = window.debugHour !== undefined ? window.debugHour : now.getHours();
    const todayStr = getISODate(now);
    const todayLog = getLog(todayStr);
    
    // Start with the default normal state
    let avatarState = 'Expressions/Deery_Normal.png';

    // Helper to check last 7 days for perfect attendance / no lates
    const checkWeeklyStats = () => {
        let workDaysCount = 0;
        let perfectAttendanceCount = 0;
        let noLatesCount = 0;
        
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dStr = getISODate(d);
            
            if (isWorkDay(dStr)) {
                workDaysCount++;
                const log = getLog(dStr);
                if (log) {
                    const hours = parseFloat(calculateHours(log));
                    const lateDay = isLate(log.morningIn, settings.morningLateThreshold) || isLate(log.afternoonIn, settings.afternoonLateThreshold);
                    const underDay = isUndertime(log.morningOut, settings.morningUndertimeThreshold) || isUndertime(log.afternoonOut, settings.afternoonUndertimeThreshold);
                    
                    if (hours >= 8 && !isTextEntry(log.morningIn)) {
                        perfectAttendanceCount++;
                        if (!lateDay && !underDay) noLatesCount++;
                    }
                }
            }
        }
        return { workDaysCount, perfectAttendanceCount, noLatesCount };
    };



    
    const weekly = checkWeeklyStats();


    // 2. WEEKLY ACHIEVEMENTS: Overwrites base states
    if (weekly.workDaysCount >= 5 && weekly.perfectAttendanceCount === weekly.workDaysCount) {
        if (weekly.noLatesCount === weekly.workDaysCount) {
            avatarState = 'Expressions/Deery_Very Happy.png';
        } else {
            avatarState = 'Expressions/Deery_Relaxed.png';
        }
    }
// 3. TODAY'S STATUS: Overwrites weekly achievements
    if (todayLog && isWorkDay(todayStr)) {
        const isLateDay = isLate(todayLog.morningIn, settings.morningLateThreshold) || isLate(todayLog.afternoonIn, settings.afternoonLateThreshold);
        const isUnderDay = isUndertime(todayLog.morningOut, settings.morningUndertimeThreshold) || isUndertime(todayLog.afternoonOut, settings.afternoonUndertimeThreshold);
        const isShiftComplete = todayLog.morningIn && todayLog.morningOut && todayLog.afternoonIn && todayLog.afternoonOut;
        
        const currentStatus = todayLog.status || 'regular';
        const statusObj = settings.statuses.find(s => s.id === currentStatus) || settings.statuses[0];

        // 1. Celebrate finishing the shift first!
        if (isShiftComplete || (currentStatus.includes('halfday') && calculateHours(todayLog) > 0)) {
            avatarState = 'Expressions/Deery_GoodJob.png';
        }
        // 2. Penalize with Sad face only if they are actively working today and late/under
        else if ((currentStatus === 'regular' || currentStatus === 'wfh' || currentStatus.includes('halfday')) && (isLateDay || isUnderDay)) {
            avatarState = 'Expressions/Deery_Sad.png';
        }
        // 3. Apply the specific Custom Status Avatars!
        else {
            if (currentStatus === 'wfh') {
                avatarState = 'Expressions/Deery_WFH.png';
            } else if (currentStatus === 'travel') {
                avatarState = 'Expressions/Deery_Travel.png';
            } else if (currentStatus === 'absent' || currentStatus.includes('halfday')) {
                avatarState = 'Expressions/Deery_Absent.png';
            } else if (currentStatus === 'suspended') {
                avatarState = 'Expressions/Deery_Suspended.png';
            } else if (currentStatus === 'sick') {
                avatarState = 'Expressions/Deery_Sick.png'; // Added the .png extension here
            } else if (currentStatus === 'holiday' || currentStatus === 'vacation') {
                avatarState = 'Expressions/Deery_Holiday_Leave.png';
            } else if (!statusObj.reqAM && !statusObj.reqPM && statusObj.isPaid){
                // Catch-all fallback for any custom paid leaves added via settings
                avatarState = 'Expressions/Deery_Holiday_Leave.png';
            }
        }
    }

    // 4. ABSOLUTE TIME OVERRIDES: Evening and Bedtime take priority over EVERYTHING!
    if (hour >= 18 && hour < 21) {
        avatarState = 'Expressions/Deery_Sleepy.png'; // 6:00 PM to 8:59 PM
    } else if (hour >= 21 && hour < 22) {
        avatarState = 'Expressions/Deery_Yawning.png'; // 9:00 PM to 9:59 PM
    } else if (hour >= 22 || hour <= 4) {
        avatarState = 'Expressions/Deery_Sleeping.png'; // 10:00 PM to 4:59 AM
    }

    // Apply the image source
    if (mainDeeryImg) mainDeeryImg.src = avatarState;
    if (headerDeeryImg) headerDeeryImg.src = avatarState;
};

// --- TOAST & MODAL NOTIFICATIONS ---

const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    const bgClass = type === 'success' ? 'bg-primary-600' : 'bg-red-600';
    // Sleeker pill-shape, smaller padding, and auto-width
    toast.className = `${bgClass} text-white px-4 py-2 rounded-full shadow-md transform transition-all duration-300 translate-y-[-20px] opacity-0 flex items-center pointer-events-auto max-w-full`;
    
    // Smaller text and icon to prevent overlap
    toast.innerHTML = `
        <span class="text-xs sm:text-sm font-medium flex items-center truncate">
            ${type === 'success' ? '<svg class="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' : ''}
            <span class="truncate">${message}</span>
        </span>
        <button onclick="this.parentElement.remove()" class="ml-3 opacity-75 hover:opacity-100 text-lg leading-none font-bold focus:outline-none flex-shrink-0">&times;</button>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-[-20px]', 'opacity-0');
    });

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-[-20px]');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const showModal = (title, body, type = 'alert', onConfirm = null) => {
    modalTitle.textContent = title;
    modalBody.innerHTML = body; 
    modalConfirmCallback = onConfirm;

    modal.classList.remove('hidden');
    modalBackdrop.classList.remove('hidden');
    
    modal.classList.add('modal-enter-active');
    modal.classList.remove('modal-enter');
    
    if (type === 'confirm') {
        modalConfirmBtn.textContent = 'Confirm';
        modalConfirmBtn.className = "px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium";
        modalCancelBtn.classList.remove('hidden');
        modalConfirmBtn.classList.remove('hidden');
    } else if (type === 'note') {
        modalConfirmBtn.classList.add('hidden');
        modalCancelBtn.textContent = 'Close';
        modalCancelBtn.classList.remove('hidden');
    } else if (type === 'success') {
        modalConfirmBtn.textContent = 'OK';
        modalConfirmBtn.className = "px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium";
        modalConfirmBtn.classList.remove('hidden');
        modalCancelBtn.classList.add('hidden');
    } else if (type === 'none') {
        // NEW: Hides all footer buttons for our custom selection modal!
        modalConfirmBtn.classList.add('hidden');
        modalCancelBtn.classList.add('hidden');
    } else { // 'alert'
        modalConfirmBtn.textContent = 'OK';
        modalConfirmBtn.className = "px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium";
        modalConfirmBtn.classList.remove('hidden');
        modalCancelBtn.classList.add('hidden');
    }
};

const hideModal = () => {
    modal.classList.remove('modal-enter-active');
    modal.classList.add('modal-leave-active');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modalBackdrop.classList.add('hidden');
        modal.classList.remove('modal-leave-active');
        modalConfirmCallback = null;
    }, 150);
};


// --- NAVIGATION & SWIPE ---

const showPage = (pageId) => {
    pages.forEach(page => {
        page.classList.remove('active');
    });
    const targetPage = document.getElementById(`page-${pageId}`);
    if(targetPage) targetPage.classList.add('active');
    
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageId);
    });
    
    window.scrollTo(0, 0); 
    
    if (pageId === 'home') {
        renderQuickLog();
        renderTodaySalarySummary();
    }
    if (pageId === 'editor') {
        renderEditorPage();
    }
    if (pageId === 'view-data') {
        renderLogsTable();
        renderStatistics();
        renderCalendar(); 
    }
    if (pageId === 'salary') {
        renderSalaryPage();
    }
    if (pageId === 'settings') {
        renderSettingsPage();
    }
};

const attachSwipeNavigation = () => {
    // Swipe navigation has been disabled.
};



// --- DEERY INTERACTION ENGINE ---
let deerySpeakTimeout;
let deeryTypeInterval;
let deeryAnimationTimeout; // <-- NEW: Prevents spam-click scrambling


// Deery's Dictionary
const DEERY_MESSAGES = {
    greeting_morning: [
        "Good morning, {name}! Ready to start your day?",
        "Morning! Let’s keep things on track today.",
        "Hope you’re feeling good today. Don’t forget to log in.",
        "A fresh start. Let’s make today count."
    ],
    greeting_afternoon: [
        "Good afternoon! How’s your day going so far?",
        "You’re halfway through, keep it up.",
        "Stay focused, you’re doing well."
    ],
    greeting_evening: [
        "Good evening, {name}. Almost done for today?",
        "Wrap things up nicely.",
        "You’re close to finishing, keep going."
    ],
    missing_log: [
        "You haven’t logged your time yet.",
        "Just a reminder to update your log.",
        "Your entry looks incomplete.",
        "Don’t forget to log your time today.",
        "It might be time to log in.",
        "Quick check, have you recorded your time?"
    ],
    late: [
        "Looks like you started a bit late.",
        "Late kana {name}.",
        "You logged in later than expected.",
        "It happens—try to start earlier next time."
    ],
    undertime: [
        "You ended earlier than usual.",
        "Your work hours are a bit short today.",
        "Try to complete your full hours if you can."
    ],
    early: [
        "Wow, you're early! That's the perfect spirit, {name}!",
        "Starting ahead of schedule. Great job!",
        "You're here early! Let's get things done."
    ],
    motivation: [
        "You’re doing well—keep it steady.",
        "Consistency makes a big difference.",
        "Small progress still counts.",
        "You’re building a good routine.",
        "Keep going, you’re on track.",
        "Stay focused, you’ve got this."
    ],
    shift_complete: [
        "All done for today. Good job, {name}.",
        "You’ve completed your shift.",
        "Everything’s logged. Nice work.",
        "That’s a full day recorded.",
        "You can relax now—well done."
    ],
    sleepy_disturbed: [
        "Please don't disturb me... get back to sleep.",
        "Five more minutes... please, {name}.",
        "It's too late for this. Sleep time...",
        "Zzz... why are we awake, {name}? Go to bed."
    ]
};

// Helper function to pick a random message and inject the username
const getRandomDeeryMessage = (category) => {
    const list = DEERY_MESSAGES[category];
    if (!list || list.length === 0) return "...";
    
    let text = list[Math.floor(Math.random() * list.length)];
    const name = currentUsername || 'User';
    return text.replace(/{name}/g, name);
};

const speakDeery = (message, duration = 6000) => {
    const clockContainer = document.getElementById('clock-container');
    const speechBubble = document.getElementById('deery-speech-bubble');
    const speechText = document.getElementById('deery-speech-text');
    
    if (!clockContainer || !speechBubble || !speechText) return;

    // FIX: Clear EVERYTHING if the user spam clicks
    clearTimeout(deeryAnimationTimeout);
    clearTimeout(deerySpeakTimeout);
    clearInterval(deeryTypeInterval);
    speechText.textContent = '';

    clockContainer.classList.add('opacity-0');
    
    // Assign this to our new variable
    deeryAnimationTimeout = setTimeout(() => {
        clockContainer.classList.add('hidden');
        speechBubble.classList.remove('hidden');
        
        requestAnimationFrame(() => {
            speechBubble.classList.remove('opacity-0');
        });
        
        let i = 0;
        deeryTypeInterval = setInterval(() => {
            speechText.textContent += message.charAt(i);
            i++;
            if (i >= message.length) {
                clearInterval(deeryTypeInterval);
                
                deerySpeakTimeout = setTimeout(() => {
                    closeDeerySpeech();
                }, duration);
            }
        }, 35); 
        
    }, 300); 
};

const closeDeerySpeech = () => {
    const clockContainer = document.getElementById('clock-container');
    const speechBubble = document.getElementById('deery-speech-bubble');
    
    speechBubble.classList.add('opacity-0');
    setTimeout(() => {
        speechBubble.classList.add('hidden');
        clockContainer.classList.remove('hidden');
        requestAnimationFrame(() => {
            clockContainer.classList.remove('opacity-0');
        });
    }, 300);
};

// Start-Up Greeting Logic
const triggerStartupGreeting = () => {
    const hour = new Date().getHours();
    const todayStr = getISODate(new Date());
    const log = getLog(todayStr);
    const name = currentUsername || "User";
    
    // Check if they are officially Absent today
    if (log && log.status === 'absent') {
        speakDeery(`Oh, you're absent today, ${name}? Make sure to rest well and take care!`, 6000);
        return;
    }
    
    // Standard Time-Based Greetings using dynamic arrays
    if (hour < 12) speakDeery(getRandomDeeryMessage('greeting_morning'), 5000);
    else if (hour < 18) speakDeery(getRandomDeeryMessage('greeting_afternoon'), 5000);
    else speakDeery(getRandomDeeryMessage('greeting_evening'), 5000);
};


// --- PAGE: HOME (QUICK LOG) & LIVE DASHBOARD ---

const updateLiveClock = () => {
    const now = new Date();
    
    // Formatted to match UI: 9:00 AM
    liveClock.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    // Formatted to match UI: Tuesday, April 28, 2026
    liveDate.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    // --- UPDATED GREETING LOGIC ---
    // Use the debugHour hook if you're still testing, otherwise get real time
    const currentHour = window.debugHour !== undefined ? window.debugHour : now.getHours();
    let timePhrase = "";
    
    if (currentHour < 12) {
        timePhrase = "Good Morning";
    } else if (currentHour < 18) {
        timePhrase = "Good Afternoon";
    } else {
        timePhrase = "Good Evening";
    }
    
    const nameToDisplay = currentUsername || 'User';
    liveGreeting.innerHTML = `${timePhrase}, <span class="font-bold">${nameToDisplay}</span>!`;
    
    // Check avatar updates on the hour
    if (now.getMinutes() === 0 && now.getSeconds() === 0) {
        updateDeeryAvatar();
    }
};

const renderQuickLog = () => {
    const today = getISODate(new Date());
    const log = getOrCreateLog(today);
    
    const statusId = log.status || 'regular';
    const statusObj = settings.statuses.find(s => s.id === statusId) || settings.statuses[0];
    
    quickLogContainer.innerHTML = ''; 
    
    if (quickLogHeader) {
        if (!statusObj.reqAM && !statusObj.reqPM) quickLogHeader.classList.add('hidden'); 
        else quickLogHeader.classList.remove('hidden'); 
    }

    // CASE A: Full Day Status (Absent, Holiday, Leave)
    if (!statusObj.reqAM && !statusObj.reqPM) {
        quickLogCard.className = 'mt-2 mb-2 p-3 sm:p-5 rounded-2xl shadow-sm border transition-colors duration-300 bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800';
        quickLogContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center py-4 animate-slideUpFade">
                <div class="w-14 h-14 bg-red-100 dark:bg-red-800/80 text-red-500 dark:text-red-300 rounded-full flex items-center justify-center shadow-sm mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h3 class="text-xl font-bold text-red-800 dark:text-red-300 mb-0.5">${statusObj.name}</h3>
                <p class="text-sm text-red-600 dark:text-red-400 font-medium text-center">No time logs required for today.</p>
            </div>
        `;
        return; 
    }

    // CASE B: Evaluate Completion based on rules
    let amDone = !statusObj.reqAM || (log.morningIn && log.morningOut);
    let pmDone = !statusObj.reqPM || (log.afternoonIn && log.afternoonOut);
    let allDone = amDone && pmDone;

    
    if (allDone) {
        quickLogCard.className = 'mt-2 mb-2 p-3 sm:p-5 rounded-2xl shadow-sm border transition-colors duration-300 bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-700';
        const hours = calculateHours(log);
        quickLogContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center py-2 animate-slideUpFade w-full">
                
                <!-- Animated Done GIF -->
                <img src="Icons/Done.gif" alt="Shift Complete" class="w-16 h-16 object-contain mb-1 drop-shadow-sm">
                
                <h3 class="text-lg font-bold text-green-800 dark:text-green-300">Shift Complete!</h3>
                <p class="text-sm text-green-600 dark:text-green-400 mt-0.5 font-medium mb-2 text-center">You logged ${hours > 0 ? hours : '0.00'} hours today.</p>
                
                <!-- Native-App Style Clickable Text Link -->
                <button onclick="openStoryModal()" class="group flex items-center justify-center gap-1.5 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200 active:scale-95 py-1.5 px-3 rounded-lg outline-none">
                    
                    <span class="text-xs sm:text-sm font-bold">Share your Daily Hustle</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-70 transform group-hover:translate-x-0.5 transition-transform"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>
        `;
        return; 
    }

    // CASE C: Draw the Buttons
    quickLogCard.className = 'mt-2 mb-2 p-3 sm:p-5 rounded-2xl shadow-sm border transition-colors duration-300 bg-white dark:bg-dark-card border-slate-100 dark:border-dark-border';

    const fields = [
        { key: 'morningIn', label: 'Morning In' },
        { key: 'morningOut', label: 'Morning Out' },
        { key: 'afternoonIn', label: 'Afternoon In' },
        { key: 'afternoonOut', label: 'Afternoon Out' }
    ];

    let nextFieldKey = null;
    for (const f of fields) {
        const isMorning = f.key.includes('morning');
        if (isMorning && !statusObj.reqAM) continue;
        if (!isMorning && !statusObj.reqPM) continue;
        
        if (!log[f.key]) {
            nextFieldKey = f.key;
            break; 
        }
    }

    for (const f of fields) {
        const logValue = log[f.key];
        const button = document.createElement('button');
        button.dataset.field = f.key;
        
        const isMorning = f.key.includes('morning');
        const isBlocked = (isMorning && !statusObj.reqAM) || (!isMorning && !statusObj.reqPM);

        if (isBlocked) {
            button.className = 'w-full flex justify-between items-center p-3 rounded-2xl text-left bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800/50 opacity-80 font-normal cursor-not-allowed';
            button.innerHTML = `<span>${f.label}</span> <span class="text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-800/50 px-2 py-0.5 rounded-md">Not Required</span>`;
            button.disabled = true;
        } 
        else if (logValue) {
            const isLateRow = f.key.includes('In') && isLate(logValue, f.key === 'morningIn' ? settings.morningLateThreshold : settings.afternoonLateThreshold);
            const isUnderRow = f.key.includes('Out') && isUndertime(logValue, f.key === 'morningOut' ? settings.morningUndertimeThreshold : settings.afternoonUndertimeThreshold);
            
            let btnClass = isLateRow ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:border-red-800 dark:text-red-300' : 
                           isUnderRow ? 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:border-orange-800 dark:text-orange-300' : 
                           'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:border-green-800 dark:text-green-300';
            
            let badge = isLateRow ? '<span class="ml-2 text-[9px] font-bold uppercase tracking-wider bg-red-200 dark:bg-red-800/50 px-1.5 py-0.5 rounded text-red-700 dark:text-red-200">Late</span>' : 
                        isUnderRow ? '<span class="ml-2 text-[9px] font-bold uppercase tracking-wider bg-orange-200 dark:bg-orange-800/50 px-1.5 py-0.5 rounded text-orange-700 dark:text-orange-200">Early</span>' : '';

            button.className = `w-full flex justify-between items-center p-3 rounded-2xl text-left border ${btnClass} font-normal`;
            const displayTime = typeof formatTime12Hour === 'function' ? formatTime12Hour(logValue) : logValue;
            button.innerHTML = `<span class="flex items-center">${f.label} ${badge}</span> <span>${displayTime}</span>`;
        }
        else if (f.key === nextFieldKey) {
            button.className = 'w-full flex justify-between items-center p-3 rounded-2xl text-left bg-primary-600 text-white border border-primary-700 shadow-lg animate-pulse font-normal';
            button.innerHTML = `<span>${f.label}</span> <span>Tap to Log Now</span>`;
            button.onclick = () => handleQuickLog(f.key);
        } 
        else {
            button.className = 'w-full flex justify-between items-center p-3 rounded-2xl text-left bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 opacity-60 font-normal cursor-not-allowed';
            button.innerHTML = `<span>${f.label}</span> <span>--:--</span>`;
            button.disabled = true;
        }
        
        quickLogContainer.appendChild(button);
    }
};

const handleQuickLog = (field) => {
    // If the setting is OFF, just log it immediately without asking
    if (!settings.requireQuickLogConfirm) {
        executeQuickLog(field);
        return;
    }

    // Otherwise, build the confirmation modal!
    const fieldName = field.replace(/([A-Z])/g, ' $1').trim(); 
    const formattedName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    // Custom Modal HTML with the "Don't ask again" checkbox
    const html = `
        <div class="mb-4">Are you sure you want to log your <b>${formattedName}</b> right now at <b>${formattedTime}</b>?</div>
        
        <label class="flex items-center gap-2.5 cursor-pointer mt-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
            <input type="checkbox" id="quick-log-dont-ask" class="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600">
            <span class="text-xs font-semibold text-slate-600 dark:text-slate-300">Don't ask me again</span>
        </label>
    `;

    showModal('Confirm Time Log', html, 'confirm', () => {
        // If they checked the box, turn the setting off permanently!
        const dontAsk = document.getElementById('quick-log-dont-ask').checked;
        if (dontAsk) {
            settings.requireQuickLogConfirm = false;
            saveSettings();
            if (settingQuickConfirm) settingQuickConfirm.checked = false; // Update UI silently
        }
        
        // Proceed with logging
        executeQuickLog(field);
    });
};

// This is your original code, just renamed to 'executeQuickLog'!
const executeQuickLog = (field) => {
    const now = new Date();
    const time = now.toTimeString().split(' ')[0].substring(0, 5); 
    const today = getISODate(now);
    
    const log = getOrCreateLog(today);
    log[field] = time;
    
    saveLogs();
    renderQuickLog();
    renderTodaySalarySummary();
    renderStatistics();
    
    updateLiveClock();
    updateDeeryAvatar(); 
    
    showToast(`Logged ${field.replace(/([A-Z])/g, ' $1').trim()} at ${time}`);

    const statusId = log.status || 'regular';
    const statusObj = settings.statuses.find(s => s.id === statusId) || settings.statuses[0];
    
    let amDone = !statusObj.reqAM || (log.morningIn && log.morningOut);
    let pmDone = !statusObj.reqPM || (log.afternoonIn && log.afternoonOut);
    
    if (amDone && pmDone) {
        speakDeery(getRandomDeeryMessage('shift_complete'), 7000);
    }
    else if (field === 'morningIn') {
        const timeVal = parseTime(time);
        const threshVal = parseTime(settings.morningLateThreshold);
        
        if (timeVal > threshVal) {
            speakDeery(getRandomDeeryMessage('late'), 6000);
        } else if (timeVal < threshVal - 30) {
            speakDeery(getRandomDeeryMessage('early'), 6000);
        } else {
            speakDeery(`Morning In recorded! Have a great shift today.`, 4000);
        }
    } 
    else if (field === 'afternoonIn') {
        const timeVal = parseTime(time);
        const threshVal = parseTime(settings.afternoonLateThreshold);
        if (timeVal > threshVal) {
            speakDeery(`Late from lunch break? Let's catch up on work!`, 5000);
        } else {
            speakDeery(`Welcome back! Let's finish the day strong.`, 4000);
        }
    }
};

const renderTodaySalarySummary = () => {
    const today = getISODate(new Date());
    const log = getLog(today);
    const { pay, deductions } = calculateSalaryForDay(log, today);
    
    let displayPay = pay.toFixed(2);
    let displayDeductions = deductions.toFixed(2);

    // If it's a weekend, force 0.00 display
    if (!isWorkDay(today)) {
        displayPay = "0.00";
        displayDeductions = "0.00";
    }
    
    todaySalarySummary.innerHTML = `
        <div class="grid grid-cols-2 gap-2 sm:gap-3 w-full">
            
            <!-- Pay Estimate Card -->
            <div class="bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800/50 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-center items-center shadow-sm transition-colors duration-200">
                <!-- Header Group (Centered) -->
                <div class="flex items-center justify-center gap-2 mb-1.5 sm:mb-2 w-full">
                    <div class="shrink-0 flex items-center justify-center">
                        <img src="Icons/EstimatePay.gif" alt="Pay Estimate" class="w-7 h-7 sm:w-8 sm:h-8 object-contain">
                    </div>
                    <div class="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight text-left">
                        Today's Pay<br>Estimate
                    </div>
                </div>
                <!-- Amount (Centered) -->
                <div class="text-lg sm:text-xl font-bold text-primary-500 dark:text-primary-400 tracking-tight text-center w-full">
                    PHP ${displayPay}
                </div>
            </div>
            
            <!-- Deductions Card -->
            <div class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-center items-center shadow-sm transition-colors duration-200">
                <!-- Header Group (Centered) -->
                <div class="flex items-center justify-center gap-2 mb-1.5 sm:mb-2 w-full">
                    <div class="shrink-0 flex items-center justify-center">
                        <img src="Icons/Deduction.gif" alt="Deductions" class="w-7 h-7 sm:w-8 sm:h-8 object-contain">
                    </div>
                    <div class="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight text-left">
                        Deductions<br>Today
                    </div>
                </div>
                <!-- Amount (Centered) -->
                <div class="text-lg sm:text-xl font-bold text-red-500 dark:text-red-400 tracking-tight text-center w-full">
                    PHP ${displayDeductions}
                </div>
            </div>
            
        </div>
    `;
};


// --- PAGE: ADD / EDIT LOGS ---

const createHybridInput = (id, label) => {
    const container = document.getElementById(`hybrid-input-${id}`);
    container.innerHTML = `
        <label for="${id}-time" class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">${label}</label>
        <input type="time" id="${id}-time" class="w-full py-2 px-2 sm:px-3 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm transition-all">
    `;
    
    const timeInput = document.getElementById(`${id}-time`);
    return (value) => { timeInput.value = value || ''; };
};

const getHybridInputValue = (id) => {
    return document.getElementById(`${id}-time`).value;
};

let inputSetters = {};

// NEW DOM Elements
const editorStatusBtn = document.getElementById('editor-status-btn');
const editorStatusText = document.getElementById('editor-status-text');
const editorStatusValue = document.getElementById('editor-status-value');
const editorTimeInputs = document.getElementById('editor-time-inputs');

// NEW: Updates the visual UI without erasing time values (for loading logs)
const updateEditorStatusUI = (statusId) => {
    const statusObj = settings.statuses.find(s => s.id === statusId) || settings.statuses[0];
    editorStatusValue.value = statusObj.id;
    editorStatusText.textContent = statusObj.name;
    
    const mIn = document.getElementById('hybrid-input-morningIn');
    const mOut = document.getElementById('hybrid-input-morningOut');
    const aIn = document.getElementById('hybrid-input-afternoonIn');
    const aOut = document.getElementById('hybrid-input-afternoonOut');

    // Reset visibility
    editorTimeInputs.classList.remove('opacity-30', 'pointer-events-none');
    [mIn, mOut, aIn, aOut].forEach(el => el.classList.remove('opacity-30', 'pointer-events-none'));

    // Lock AM inputs if not required
    if (!statusObj.reqAM) {
        mIn.classList.add('opacity-30', 'pointer-events-none');
        mOut.classList.add('opacity-30', 'pointer-events-none');
    }
    // Lock PM inputs if not required
    if (!statusObj.reqPM) {
        aIn.classList.add('opacity-30', 'pointer-events-none');
        aOut.classList.add('opacity-30', 'pointer-events-none');
    }
    // Fade out entirely if neither are required
    if (!statusObj.reqAM && !statusObj.reqPM) {
        editorTimeInputs.classList.add('opacity-30', 'pointer-events-none');
    }
};

window.selectEditorStatus = (statusId) => {
    updateEditorStatusUI(statusId);
    
    const statusObj = settings.statuses.find(s => s.id === statusId);
    // Erase specific times if the user selects a status that doesn't need them
    if (statusObj) {
        if (!statusObj.reqAM) { inputSetters['morningIn'](''); inputSetters['morningOut'](''); }
        if (!statusObj.reqPM) { inputSetters['afternoonIn'](''); inputSetters['afternoonOut'](''); }
    }
    
    hideModal(); 
};

const renderEditorPage = () => {
    if (!inputSetters['morningIn']) {
        inputSetters['morningIn'] = createHybridInput('morningIn', 'Morning In');
        inputSetters['morningOut'] = createHybridInput('morningOut', 'Morning Out');
        inputSetters['afternoonIn'] = createHybridInput('afternoonIn', 'Afternoon In');
        inputSetters['afternoonOut'] = createHybridInput('afternoonOut', 'Afternoon Out');
        
       
        // NEW: Open Modal on Button Click with a dynamic grid of COMPACT status buttons
        editorStatusBtn.addEventListener('click', () => {
            // Changed: gap-2.5 to gap-2 for a tighter grid
            const buttonsHtml = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-[60vh] overflow-y-auto pr-1 pb-1">` + 
                settings.statuses.map(s => {
                    const isActive = editorStatusValue.value === s.id;
                    
                    // Determine Premium Color Palette based on isPaid
                    let borderClass, bgClass, textClass;
                    
                    if (s.isPaid) {
                        borderClass = isActive ? 'border-green-500 ring-1 ring-green-500 shadow-md' : 'border-green-200 dark:border-green-800/50';
                        bgClass = isActive ? 'bg-green-100 dark:bg-green-900/60' : 'bg-green-50/50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/30';
                        textClass = isActive ? 'text-green-800 dark:text-green-300' : 'text-green-700 dark:text-green-400';
                    } else {
                        borderClass = isActive ? 'border-red-500 ring-1 ring-red-500 shadow-md' : 'border-red-200 dark:border-red-800/50';
                        bgClass = isActive ? 'bg-red-100 dark:bg-red-900/60' : 'bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30';
                        textClass = isActive ? 'text-red-800 dark:text-red-300' : 'text-red-700 dark:text-red-400';
                    }

                    // Changed: p-3 to px-3 py-2, text-sm to text-xs, and shrunk the checkmark icon
                    return `
                    <button type="button" onclick="selectEditorStatus('${s.id}')" class="px-3 py-2 text-left border ${borderClass} ${bgClass} rounded-xl transition-all flex flex-col items-start group relative overflow-hidden">
                        <span class="text-xs font-bold ${textClass} mb-0.5 leading-tight z-10">${s.name}</span>
                        <span class="text-[9px] font-bold tracking-wider uppercase opacity-70 ${textClass} z-10">${s.isPaid ? 'Paid' : 'Unpaid'}</span>
                        
                        ${isActive ? `<div class="absolute right-2.5 top-1/2 -translate-y-1/2 ${textClass} opacity-90">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>` : ''}
                    </button>`;
                }).join('') + `</div>`;
            
            showModal('Select Daily Status', buttonsHtml, 'none');
        });
    }
    
    // Fill the Bulk Apply dropdown with the options
    document.getElementById('bulk-status').innerHTML = settings.statuses.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

    if (!editorDate.value) editorDate.value = getISODate(new Date());
    loadLogForEditing(); 
};

const loadLogForEditing = () => {
    const date = editorDate.value;
    const log = getLog(date);
    
    if (log) {
        updateEditorStatusUI(log.status || 'regular');
        inputSetters['morningIn'](log.morningIn);
        inputSetters['morningOut'](log.morningOut);
        inputSetters['afternoonIn'](log.afternoonIn);
        inputSetters['afternoonOut'](log.afternoonOut);
        editorNotes.value = log.notes || '';
        editorDeleteBtn.classList.remove('hidden');
    } else {
        updateEditorStatusUI('regular');
        inputSetters['morningIn'](''); inputSetters['morningOut']('');
        inputSetters['afternoonIn'](''); inputSetters['afternoonOut']('');
        editorNotes.value = '';
        editorDeleteBtn.classList.add('hidden');
    }
};

const handleEditorSave = (e) => {
    e.preventDefault();
    const date = editorDate.value;
    if (!date) return;
    
    let log = getOrCreateLog(date);
    log.status = editorStatusValue.value; // SAVES FROM THE HIDDEN INPUT!
    log.morningIn = getHybridInputValue('morningIn');
    log.morningOut = getHybridInputValue('morningOut');
    log.afternoonIn = getHybridInputValue('afternoonIn');
    log.afternoonOut = getHybridInputValue('afternoonOut');
    log.notes = editorNotes.value;
    
    saveLogs();
    showToast(`Log for ${formatDateReadable(date)} saved`);
    
    renderLogsTable(); renderStatistics(); renderSalaryPage(); updateDeeryAvatar();
};

const handleEditorDelete = () => {
    const date = editorDate.value;
    const log = getLog(date);
    
    if (!log) {
        showModal('Error', 'No log found for this date to delete.', 'alert');
        return;
    }
    
    showModal(
        'Delete Log', 
        `Are you sure you want to delete the log for ${formatDateReadable(date)}? This cannot be undone.`, 
        'confirm',
        () => {
            logs = logs.filter(l => l.date !== date);
            saveLogs();
            loadLogForEditing(); 
            showToast('Log deleted successfully');
            renderLogsTable();
            renderStatistics();
            renderSalaryPage();
            updateDeeryAvatar();
        }
    );
};

const handleBulkApply = (e) => {
    e.preventDefault();
    const startDate = bulkStartDate.value;
    const endDate = bulkEndDate.value;
    const status = bulkStatus.value;

    if (!startDate || !endDate || !status) {
        showModal('Error', 'Please fill in all fields for bulk apply.', 'alert');
        return;
    }
    
    if (startDate > endDate) {
        showModal('Error', 'Start date must be before or the same as the end date.', 'alert');
        return;
    }

    showModal(
        'Confirm Bulk Apply',
        `Apply "${status}" to all workdays from ${formatDateReadable(startDate)} to ${formatDateReadable(endDate)}? This will overwrite existing time entries.`,
        'confirm',
        () => {
            const [sy, sm, sd] = startDate.split('-').map(Number);
            const [ey, em, ed] = endDate.split('-').map(Number);
            
            let currentDate = new Date(sy, sm - 1, sd);
            const lastDate = new Date(ey, em - 1, ed);
            let appliedCount = 0;

            while (currentDate <= lastDate) {
                const dateStr = getISODate(currentDate);
               if (isWorkDay(dateStr)) {
                    let log = getOrCreateLog(dateStr);
                    log.status = status; // Writes to the dropdown value
                    log.morningIn = ''; log.morningOut = ''; log.afternoonIn = ''; log.afternoonOut = ''; // Clears the times
                    log.notes = "Bulk Applied";
                    appliedCount++;
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            saveLogs();
            showToast(`Applied "${status}" to ${appliedCount} workdays`);
            renderLogsTable();
            renderStatistics();
            renderSalaryPage();
            updateDeeryAvatar();
        }
    );
};


// --- PAGE: VIEW DATA & CALENDAR ---

const calculateHours = (log) => {
    if (!log) return 0;
    
    const mIn = parseTime(log.morningIn);
    const mOut = parseTime(log.morningOut);
    const aIn = parseTime(log.afternoonIn);
    const aOut = parseTime(log.afternoonOut);
    
    let totalMinutes = 0;
    
    if (!isNaN(mIn) && !isNaN(mOut) && mOut > mIn) {
        totalMinutes += mOut - mIn;
    }
    if (!isNaN(aIn) && !isNaN(aOut) && aOut > aIn) {
        totalMinutes += aOut - aIn;
    }

    totalMinutes = Math.min(totalMinutes, 480); // Cap at 8 hours max
    
    return (totalMinutes / 60).toFixed(2);
};

const setupDateFilters = () => {
    const today = new Date();
    const currentMonth = today.getMonth(); 
    const currentYear = today.getFullYear();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    viewFilterMonth.innerHTML = monthNames.map((name, index) => 
        `<option value="${index}" ${index === currentMonth ? 'selected' : ''}>${name}</option>`
    ).join('');

    let yearOptions = '';
    // Increases the future limit to 10 years ahead
    // Years expansion
    for (let y = currentYear - 2; y <= currentYear + 5; y++) {
        yearOptions += `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`;
    }
    viewFilterYear.innerHTML = yearOptions;

    viewFilterMonth.addEventListener('change', () => { renderLogsTable(); renderCalendar(); renderStatistics(); });
   viewFilterYear.addEventListener('change', () => { 
        renderLogsTable(); 
        renderCalendar(); 
        renderStatistics(); 
        if(!historyAnalyticsView.classList.contains('hidden')) renderAnalyticsDashboard(); 
    });
};

const switchViewMode = (mode) => {
    // Define the exact classes for the blue (active) and gray (inactive) states
    const activeClasses = ['bg-primary-600', 'text-white', 'shadow-sm'];
    const inactiveClasses = ['text-slate-600', 'dark:text-slate-300', 'hover:text-slate-900'];

    if (mode === 'table') {
        // Show Table, Hide Calendar
        viewModeTable.classList.remove('hidden');
        viewModeCalendar.classList.add('hidden');
        
        // Make Table Button Blue
        viewToggleTable.classList.add(...activeClasses);
        viewToggleTable.classList.remove(...inactiveClasses);
        
        // Make Grid Button Gray
        viewToggleCalendar.classList.remove(...activeClasses);
        viewToggleCalendar.classList.add(...inactiveClasses);
        
    } else {
        // Hide Table, Show Calendar
        viewModeTable.classList.add('hidden');
        viewModeCalendar.classList.remove('hidden');
        
        // Make Grid Button Blue
        viewToggleCalendar.classList.add(...activeClasses);
        viewToggleCalendar.classList.remove(...inactiveClasses);
        
        // Make Table Button Gray
        viewToggleTable.classList.remove(...activeClasses);
        viewToggleTable.classList.add(...inactiveClasses);
        
        renderCalendar();
    }
};

const switchMasterView = (mode) => {
    const activeClasses = ['bg-primary-600', 'text-white', 'shadow-sm'];
    const inactiveClasses = ['text-slate-600', 'dark:text-slate-300', 'hover:text-slate-900'];

    if (mode === 'data') {
        historyDataView.classList.remove('hidden');
        historyAnalyticsView.classList.add('hidden');
        
        toggleDataViewBtn.classList.add(...activeClasses);
        toggleDataViewBtn.classList.remove(...inactiveClasses);
        toggleAnalyticsViewBtn.classList.remove(...activeClasses);
        toggleAnalyticsViewBtn.classList.add(...inactiveClasses);
    } else {
        historyDataView.classList.add('hidden');
        historyAnalyticsView.classList.remove('hidden');
        
        toggleAnalyticsViewBtn.classList.add(...activeClasses);
        toggleAnalyticsViewBtn.classList.remove(...inactiveClasses);
        toggleDataViewBtn.classList.remove(...activeClasses);
        toggleDataViewBtn.classList.add(...inactiveClasses);
        
        renderAnalyticsDashboard(); // Render charts when opened!
    }
};

const renderAnalyticsDashboard = () => {
    // 1. Gather Data based on selected year
    const selectedYear = parseInt(viewFilterYear.value);
    
    const monthlyPay = Array(12).fill(0);
    const monthlyDed = Array(12).fill(0);
    const monthlyHours = Array(12).fill(0);
    const monthlyLates = Array(12).fill(0);
    const monthlyUnders = Array(12).fill(0);
    const statusCounts = {};

    logs.forEach(log => {
        const [y, m, d] = log.date.split('-').map(Number);
        if (y === selectedYear) {
            const monthIdx = m - 1;
            const salary = calculateSalaryForDay(log, log.date);
            const hours = parseFloat(calculateHours(log));
            
            monthlyPay[monthIdx] += salary.pay;
            monthlyDed[monthIdx] += salary.deductions;
            monthlyHours[monthIdx] += hours;
            
            monthlyLates[monthIdx] += calculateLateMinutes(log);
            monthlyUnders[monthIdx] += calculateUndertimeMinutes(log);
            
            if (isWorkDay(log.date)) {
                const statusName = (settings.statuses.find(s => s.id === (log.status || 'regular')) || settings.statuses[0]).name;
                statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
            }
        }
    });

    // Chart Global Settings
    Chart.defaults.color = '#94a3b8'; // Slate-400 so it looks good in Dark/Light mode
    Chart.defaults.font.family = "'Roboto', sans-serif";
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // 2. Chart 1: Financial Trends (Bar)
    if (chartFinanceInst) chartFinanceInst.destroy();
    chartFinanceInst = new Chart(document.getElementById('chartFinance'), {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [
                { label: 'Net Pay (PHP)', data: monthlyPay, backgroundColor: '#10b981', borderRadius: 4 },
                { label: 'Deductions (PHP)', data: monthlyDed, backgroundColor: '#ef4444', borderRadius: 4 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });

    // 3. Chart 2: Time & Effort (Line)
    if (chartHoursInst) chartHoursInst.destroy();
    chartHoursInst = new Chart(document.getElementById('chartHours'), {
        type: 'line',
        data: {
            labels: monthLabels,
            datasets: [{
                label: 'Total Hours',
                data: monthlyHours,
                borderColor: '#178aff',
                backgroundColor: 'rgba(23, 138, 255, 0.2)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });

    // 4. Chart 3: Attendance Breakdown (Donut)
    if (chartAttendanceInst) chartAttendanceInst.destroy();
    const statusLabels = Object.keys(statusCounts);
    const statusData = Object.values(statusCounts);
    // Cool gradient array for the pie slices
    const pieColors = ['#178aff', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e', '#64748b'];
    
    chartAttendanceInst = new Chart(document.getElementById('chartAttendance'), {
        type: 'doughnut',
        data: {
            labels: statusLabels.length ? statusLabels : ['No Data'],
            datasets: [{ data: statusData.length ? statusData : [1], backgroundColor: pieColors, borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } } }
    });

    // 5. Chart 4: Penalty Profiler (Horizontal Bar)
    if (chartPenaltiesInst) chartPenaltiesInst.destroy();
    chartPenaltiesInst = new Chart(document.getElementById('chartPenalties'), {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [
                { label: 'Late (Mins)', data: monthlyLates, backgroundColor: '#f59e0b', borderRadius: 4 },
                { label: 'Early Cut (Mins)', data: monthlyUnders, backgroundColor: '#f43f5e', borderRadius: 4 }
            ]
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true, stacked: true }, y: { stacked: true } } }
    });
};

const renderCalendar = () => {
    const selectedMonth = parseInt(viewFilterMonth.value);
    const selectedYear = parseInt(viewFilterYear.value);
    
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const startingDayOfWeek = firstDay.getDay(); 
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    let html = '';
    
    for (let i = 0; i < startingDayOfWeek; i++) {
        html += `<div class="bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>`;
    }
    
    const todayStr = getISODate(new Date());

    for (let d = 1; d <= daysInMonth; d++) {
        const currentDate = new Date(selectedYear, selectedMonth, d);
        const dateStr = getISODate(currentDate);
        const log = getLog(dateStr);
        const isToday = dateStr === todayStr;
        const isWeekend = !isWorkDay(dateStr);
        
        let statusColor = 'bg-transparent'; 
        
        if (isWeekend) {
            statusColor = 'bg-slate-400';
        } else if (dateStr <= todayStr) {
            if (!log) {
                if (dateStr < todayStr) statusColor = 'bg-red-500';
            } else {
                const hours = parseFloat(calculateHours(log));
                const currentStatus = log.status || 'regular';
                const statusObj = settings.statuses.find(s => s.id === currentStatus);
                const isLateDay = isLate(log.morningIn, settings.morningLateThreshold) || isLate(log.afternoonIn, settings.afternoonLateThreshold);
                const isUnderDay = isUndertime(log.morningOut, settings.morningUndertimeThreshold) || isUndertime(log.afternoonOut, settings.afternoonUndertimeThreshold);
                
                if (statusObj && !statusObj.requiresTime) {
                    if (currentStatus === 'absent') statusColor = 'bg-red-500';
                    else if (statusObj.isPaid) statusColor = 'bg-blue-400'; // Leave
                    else statusColor = 'bg-orange-400'; // Unpaid Leave
                } else if (currentStatus.includes('halfday')) {
                    statusColor = 'bg-orange-500'; // Half day indicator
                } else if (hours === 0) {
                    statusColor = 'bg-red-500';
                } else if (isLateDay || isUnderDay) {
                    statusColor = 'bg-yellow-500';
                } else {
                    statusColor = 'bg-primary-500';
                }
            }
        }

        const bgClass = isToday ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' : 'bg-white dark:bg-slate-800';
        const textClass = isToday ? 'text-primary-700 dark:text-primary-400 font-bold' : 'text-slate-700 dark:text-slate-300';

        // Inside renderCalendar()
html += `
    <div class="calendar-day p-1.5 border border-slate-100 dark:border-slate-700 ${bgClass} rounded-lg cursor-pointer hover:shadow-md transition-shadow" onclick="editLogFromCalendar('${dateStr}')">
        <div class="${textClass} text-[10px] sm:text-xs">${d}</div>
        <div class="flex justify-end">
            <span class="w-2.5 h-2.5 rounded-full ${statusColor}"></span>
        </div>
    </div>
`;
    }
    
    calendarGrid.innerHTML = html;
};

window.editLogFromCalendar = (dateStr) => {
    editorDate.value = dateStr;
    showPage('editor');
};

const renderLogsTable = () => {
    const selectedMonth = parseInt(viewFilterMonth.value);
    const selectedYear = parseInt(viewFilterYear.value);

    const filteredLogs = logs.filter(log => {
        if (!log.date) return false;
        const [y, m, d] = log.date.split('-').map(Number);
        return y === selectedYear && (m - 1) === selectedMonth;
    });

    if (filteredLogs.length === 0) {
        logsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                    No logs found for this month.
                </td>
            </tr>
        `;
        return;
    }
    
    filteredLogs.sort((a, b) => a.date.localeCompare(b.date));

    logsTableBody.innerHTML = filteredLogs.map(log => {
        const isMInLate = isLate(log.morningIn, settings.morningLateThreshold);
        const isAInLate = isLate(log.afternoonIn, settings.afternoonLateThreshold);
        const isMOutUnder = isUndertime(log.morningOut, settings.morningUndertimeThreshold);
        const isAOutUnder = isUndertime(log.afternoonOut, settings.afternoonUndertimeThreshold);
        const hours = calculateHours(log);
        
        const currentStatus = log.status || 'regular';
        const statusObj = settings.statuses.find(s => s.id === currentStatus) || settings.statuses[0];
        const statusBadge = currentStatus === 'regular' ? '--' : `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${statusObj.isPaid ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200'}">${statusObj.name}</span>`;
        
        const createCell = (content, isLate = false, isUnder = false, classes = '') => {
            let textClass = content === '--' ? 'text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-200';
            let badge = '';
            if (isLate) badge += `<span class="ml-1 px-1 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200">Late</span>`;
            if (isUnder) badge += `<span class="ml-1 px-1 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200">Early</span>`;
            return `<td class="px-2 py-1.5 text-xs whitespace-nowrap ${classes} ${textClass}">${content} ${badge}</td>`;
        };

        return `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td class="px-3 py-1.5 text-[11px] font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">${formatDateReadable(log.date)}</td>
                <td class="px-2 py-1.5 text-[11px] whitespace-nowrap">${statusBadge}</td>
             
${createCell(formatTime12Hour(log.morningIn), isMInLate, false, 'bg-blue-50/30 dark:bg-blue-900/10')}
${createCell(formatTime12Hour(log.morningOut), false, isMOutUnder, 'bg-blue-50/30 dark:bg-blue-900/10')}
${createCell(formatTime12Hour(log.afternoonIn), isAInLate, false, 'bg-primary-50/30 dark:bg-primary-900/10')}
${createCell(formatTime12Hour(log.afternoonOut), false, isAOutUnder, 'bg-primary-50/30 dark:bg-primary-900/10')}

                <td class="px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap">${hours > 0 ? hours : '--'}</td>
                <td class="px-2 py-1.5 text-[11px] text-slate-500 dark:text-slate-400 note-cell" data-note="${log.notes || ''}" title="Click to view note">${log.notes || '--'}</td>
                <td class="px-2 py-1.5 text-center text-xs whitespace-nowrap">
                    <button class="edit-log-btn text-primary-600 dark:text-primary-400 hover:text-primary-800" data-date="${log.date}" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                </td>
            </tr>
        `;
    }).join('');
};

const renderStatistics = () => {
    const selectedMonth = parseInt(viewFilterMonth.value);
    const selectedYear = parseInt(viewFilterYear.value);
    
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    
    const firstDayStr = getISODate(firstDay);
    const lastDayStr = getISODate(lastDay);
    
    const monthLogs = logs.filter(log => log.date >= firstDayStr && log.date <= lastDayStr);
    
    let totalWorkDays = 0;
    let totalHours = 0;
    let totalLates = 0;
    let totalUndertimes = 0;
    let totalAbsences = 0;
    
    monthLogs.forEach(log => {
        if (isWorkDay(log.date)) {
            const hours = parseFloat(calculateHours(log));
            if (hours > 0) {
                totalWorkDays++;
                totalHours += hours;
            }
            
            if (isLate(log.morningIn, settings.morningLateThreshold) || isLate(log.afternoonIn, settings.afternoonLateThreshold)) {
                totalLates++;
            }
            
            if (isUndertime(log.morningOut, settings.morningUndertimeThreshold) || isUndertime(log.afternoonOut, settings.afternoonUndertimeThreshold)) {
                totalUndertimes++;
            }
            
            const currentStatus = log.status || 'regular';
            if (currentStatus === 'absent') {
                totalAbsences++; 
            }
        }
    });

    let currentDate = firstDay;
    while (currentDate <= lastDay) {
        const dateStr = getISODate(currentDate);
        if (isWorkDay(dateStr) && !getLog(dateStr)) {
            totalAbsences++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    statsWorkDays.textContent = totalWorkDays;
    statsHours.textContent = totalHours.toFixed(2);
    statsLates.textContent = totalLates;
    statsUndertimes.textContent = totalUndertimes;
    statsAbsences.textContent = totalAbsences;
};

const isLate = (time, threshold) => {
    if (!time || isTextEntry(time)) return false;
    return time > threshold;
};

const isUndertime = (time, threshold) => {
    if (!time || isTextEntry(time)) return false;
    return time < threshold;
};

const handleTableClick = (e) => {
    const editBtn = e.target.closest('.edit-log-btn');
    if (editBtn) {
        const date = editBtn.dataset.date;
        editorDate.value = date;
        loadLogForEditing();
        showPage('editor');
    }
    
    const noteCell = e.target.closest('.note-cell');
    if (noteCell) {
        const note = noteCell.dataset.note;
        const date = noteCell.closest('tr').querySelector('.edit-log-btn').dataset.date;
        if (note) {
            showModal(`Note for ${formatDateReadable(date)}`, `<p class="whitespace-pre-wrap break-words">${note}</p>`, 'note');
        }
    }
};

// --- JSON BACKUP & RESTORE ---

const handleJsonBackup = () => {
    const backupData = {
        version: 1,
        date: new Date().toISOString(),
        logs: logs,
        settings: settings,
        monthlyData: monthlyData
    };
    
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `dtr_backup_${getISODate(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Backup file downloaded');
};

const handleJsonRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            
            if (!data.logs || !data.settings) {
                throw new Error('Invalid backup file format.');
            }

            showModal('Confirm Restore', 
                `Restoring backup from <b>${new Date(data.date).toLocaleDateString()}</b>. This will overwrite current data. Continue?`,
                'confirm',
                () => {
                            // Step 1: Push the raw backup data straight to browser storage
                            localStorage.setItem(DB_KEY, JSON.stringify(data.logs || []));
                            localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings || {}));
                            localStorage.setItem(MONTHLY_DATA_KEY, JSON.stringify(data.monthlyData || {}));
                            
                            // Step 2: Fire your native loading functions! 
                            // This ensures all missing defaults (like new Statuses) are securely merged and old data is migrated.
                            loadSettings(); 
                            loadMonthlyData();
                            loadLogs();
                            
                            // Step 3: Re-render the UI
                            renderLogsTable();
                            renderStatistics();
                            renderSalaryPage();
                            renderSettingsPage();
                            updateDeeryAvatar();
                            
                            showToast('System restored successfully');
                        }
            );
        } catch (error) {
            showModal('Error', 'Failed to restore: ' + error.message, 'alert');
        } finally {
            restoreJsonInput.value = ''; 
        }
    };
    reader.readAsText(file);
};


// --- EXCEL & CSV ---

const handleExport = (period) => {
    let dataToExport = [...logs];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); 
    
    if (period === '15th') {
        const firstDay = getISODate(new Date(year, month, 1));
        const fifteenthDay = getISODate(new Date(year, month, 15));
        dataToExport = logs.filter(log => log.date >= firstDay && log.date <= fifteenthDay);
    } else if (period === 'month') {
        const firstDay = getISODate(new Date(year, month, 1));
        const lastDay = getISODate(new Date(year, month + 1, 0));
        dataToExport = logs.filter(log => log.date >= firstDay && log.date <= lastDay);
    }

    if (dataToExport.length === 0) {
        showModal('Info', 'No data to export for the selected period.', 'alert');
        return;
    }
    
    const quoteField = (field) => {
        if (field === undefined || field === null) return '""';
        let str = String(field);
        str = str.replace(/"/g, '""'); 
        return `"${str}"`;
    };

    const header = "Date,Morning In,Morning Out,Afternoon In,Afternoon Out,Notes\n";
    const rows = dataToExport.map(log => {
        return [
            quoteField(log.date),
            quoteField(log.morningIn),
            quoteField(log.morningOut),
            quoteField(log.afternoonIn),
            quoteField(log.afternoonOut),
            quoteField(log.notes)
        ].join(",");
    }).join("\n");
    
    const csvContent = header + rows;
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dtr_export_${period}_${getISODate(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const normalizeImportTime = (val) => {
    if (!val) return '';
    let str = String(val).trim();
    if (!/\d/.test(str)) return str;
    const isPM = /pm/i.test(str);
    const isAM = /am/i.test(str);
    let cleanStr = str.replace(/[^0-9:]/g, ''); 
    let parts = cleanStr.split(':');
    let h = parseInt(parts[0]);
    let m = parseInt(parts[1]);
    if (isNaN(h)) return str; 
    if (isNaN(m)) m = 0;
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!/\.xlsx?$|\.xls?$/.test(file.name)) {
        showModal('Error', 'Please select an Excel file (.xlsx or .xls).', 'alert');
        importFileInput.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                header: 1, 
                raw: false,
                dateNF: 'yyyy-mm-dd' 
            });

            if (!jsonData || jsonData.length <= 1) throw new Error('File is empty or invalid.');

            const parseExcelDate = (val) => {
                if (val instanceof Date) return getISODate(val);
                if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) return val.trim();
                return null;
            };

            const importedLogs = [];
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row || row.length === 0) continue;

                const dateVal = row[0];
                const dateStr = parseExcelDate(dateVal);

                if (!dateStr) continue; 

                importedLogs.push({
                    date: dateStr,
                    morningIn: normalizeImportTime(row[1]),
                    morningOut: normalizeImportTime(row[2]),
                    afternoonIn: normalizeImportTime(row[3]),
                    afternoonOut: normalizeImportTime(row[4]),
                    notes: row[5] ? String(row[5]).trim() : ''
                });
            }
            
            if (importedLogs.length === 0) throw new Error('No valid logs found in file.');
            
            const logMap = new Map(logs.map(log => [log.date, log]));
            let importCount = 0;
            
            importedLogs.forEach(log => {
                logMap.set(log.date, { ...createEmptyLog(log.date), ...log });
                importCount++;
            });

            logs = Array.from(logMap.values());
            saveLogs();
            renderLogsTable();
            renderStatistics();
            renderSalaryPage();
            updateDeeryAvatar();
            showToast(`Imported ${importCount} records successfully`);

        } catch (error) {
            console.error("Import failed:", error);
            showModal('Error', `Import failed: ${error.message}`, 'alert');
        } finally {
            importFileInput.value = '';
        }
    };
    reader.readAsArrayBuffer(file);
};

const clearAllData = () => {
    showModal(
        'Clear All Data',
        'Are you sure you want to delete ALL log data? This action cannot be undone.',
        'confirm',
        () => {
            logs = [];
            saveLogs();
            renderLogsTable();
            renderStatistics();
            renderSalaryPage();
            updateDeeryAvatar();
            showToast('All log data cleared');
        }
    );
};


// --- PAGE: SALARY ---

const calculateLateMinutes = (log) => {
    if (!log) return 0;
    let totalLate = 0;
    const mIn = parseTime(log.morningIn);
    const mLate = parseTime(settings.morningLateThreshold);
    if (!isNaN(mIn) && !isNaN(mLate) && mIn > mLate) {
        totalLate += mIn - mLate;
    }
    const aIn = parseTime(log.afternoonIn);
    const aLate = parseTime(settings.afternoonLateThreshold);
    if (!isNaN(aIn) && !isNaN(aLate) && aIn > aLate) {
        totalLate += aIn - aLate;
    }
    return totalLate;
};

const calculateUndertimeMinutes = (log) => {
    if (!log) return 0;
    let totalUnder = 0;
    
    const mOut = parseTime(log.morningOut);
    const mUnder = parseTime(settings.morningUndertimeThreshold);
    if (!isNaN(mOut) && !isNaN(mUnder) && mOut < mUnder) {
        totalUnder += mUnder - mOut;
    }
    
    const aOut = parseTime(log.afternoonOut);
    const aUnder = parseTime(settings.afternoonUndertimeThreshold);
    if (!isNaN(aOut) && !isNaN(aUnder) && aOut < aUnder) {
        totalUnder += aUnder - aOut;
    }
    return totalUnder;
};

const calculateSalaryForDay = (log, dateStr) => {
    const isWeekEnd = !isWorkDay(dateStr);
    
    if (!log) {
        if (isWeekEnd) return { pay: 0, deductions: 0, status: 'Weekend' };
        return { pay: 0, deductions: 0, status: 'No Log (Absent)' };
    }
    
    const statusObj = settings.statuses.find(s => s.id === (log.status || 'regular')) || settings.statuses[0];
    const hours = parseFloat(calculateHours(log));
    
    // FIX: Grab the multiplier (e.g., 2.0 for 200%), default to 1.0 (100%)
    const payMultiplier = statusObj.payMultiplier || 1.0; 

    // SMART SALARY ENGINE
    if (!statusObj.reqAM && !statusObj.reqPM){
        if (statusObj.isPaid) {
            // Full Day Special Pay (e.g., Unworked Holiday)
            return { pay: (settings.dailySalary * payMultiplier), deductions: 0, status: statusObj.name }; 
        } else {
            return { pay: 0, deductions: 0, status: statusObj.name }; // No Pay
        }
    }

    if (hours === 0 && isWeekEnd) return { pay: 0, deductions: 0, status: 'Weekend' };
    if (hours === 0) return { pay: 0, deductions: 0, status: 'Absent' };
    
    const lateDeduction = calculateLateMinutes(log) * settings.deductionPerMinute;
    const undertimeDeduction = calculateUndertimeMinutes(log) * settings.undertimeDeductionPerMinute;
    const totalDeductions = lateDeduction + undertimeDeduction;
    
    // FIX: Apply multiplier to the worked hours (e.g., Double Pay on a worked shift)
    const grossPay = ((settings.dailySalary / 8) * hours) * payMultiplier; 
    const pay = Math.max(0, grossPay - totalDeductions);
    
    let displayStatus = statusObj.name;
    if (hours < 8 && statusObj.id === 'regular') displayStatus = 'Partial Day';

    return { pay, deductions: totalDeductions, status: displayStatus };
};

const getMonthlyHistory = () => {
    const history = {};
    
    logs.forEach(log => {
        const monthKey = log.date.substring(0, 7); 
        if (!history[monthKey]) {
            history[monthKey] = { pay: 0, deductions: 0, workDays: 0, hours: 0 };
        }
        
        const salary = calculateSalaryForDay(log, log.date);
        
        if (salary.pay > 0 || salary.status === 'Present' || salary.status === 'Partial Day') {
            history[monthKey].pay += salary.pay;
            history[monthKey].deductions += salary.deductions;
            
            const hours = parseFloat(calculateHours(log));
            if (hours > 0) {
                history[monthKey].hours += hours;
                history[monthKey].workDays++;
            }
        }
    });
    
    Object.keys(history).forEach(key => {
        if (monthlyData[key] && monthlyData[key].actualNetPay) {
            history[key].actualNetPay = monthlyData[key].actualNetPay;
        }
    });
    
    Object.keys(monthlyData).forEach(key => {
        if (!history[key]) {
            history[key] = { pay: 0, deductions: 0, workDays: 0, hours: 0, actualNetPay: monthlyData[key].actualNetPay };
        }
    });

    return Object.entries(history).sort((a, b) => b[0].localeCompare(a[0]));
};

const renderSalaryPage = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const todayStr = getISODate(today);

    // 1. Today's Pay
    const todayLog = getLog(todayStr);
    const todaySalary = calculateSalaryForDay(todayLog, todayStr);
    salaryToday.textContent = `PHP ${todaySalary.pay.toFixed(2)}`;
    if (todaySalary.deductions > 0) {
        salaryTodayDeductions.textContent = `Deductions: PHP ${todaySalary.deductions.toFixed(2)}`;
    } else if (todaySalary.status !== 'Present' && todaySalary.status !== 'Weekend' && todaySalary.status !== 'Partial Day') {
        salaryTodayDeductions.textContent = `Status: ${todaySalary.status}`;
    } else if (todaySalary.status === 'Partial Day') {
        salaryTodayDeductions.textContent = `Partial Day`;
    } else {
        salaryTodayDeductions.textContent = 'No deductions today.';
    }

    // 2. 15th Cutoff
    let total15thPay = 0;
    let total15thDeductions = 0;
    let workDays15th = 0;
    
    for (let d = 1; d <= 15; d++) {
        const date = new Date(year, month, d);
        const dateStr = getISODate(date);
        const log = getLog(dateStr);
        const daySalary = calculateSalaryForDay(log, dateStr);
        
        // Add up all pay and deductions automatically
        total15thPay += daySalary.pay;
        total15thDeductions += daySalary.deductions;
        
        // Count as a workday if you got paid OR if you logged hours
        if (daySalary.pay > 0 || (log && calculateHours(log) > 0)) {
            workDays15th++;
        }
    }
    
    salary15th.textContent = `PHP ${total15thPay.toFixed(2)}`;
    salary15thSummary.textContent = `${workDays15th} work days, PHP ${total15thDeductions.toFixed(2)} deductions.`;

    // 3. 16th to End of Month Cutoff
    let total16thPay = 0;
    let total16thDeductions = 0;
    let workDays16th = 0;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let d = 16; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dateStr = getISODate(date);
        const log = getLog(dateStr);
        const daySalary = calculateSalaryForDay(log, dateStr);
        
        total16thPay += daySalary.pay;
        total16thDeductions += daySalary.deductions;
        
        if (daySalary.pay > 0 || (log && calculateHours(log) > 0)) {
            workDays16th++;
        }
    }
    
    salary16th.textContent = `PHP ${total16thPay.toFixed(2)}`;
    salary16thSummary.textContent = `${workDays16th} work days, PHP ${total16thDeductions.toFixed(2)} deductions.`;

    // 4. Full Month (Calculated simply by adding the two cutoffs together)
    let totalMonthPay = total15thPay + total16thPay;
    let totalMonthDeductions = total15thDeductions + total16thDeductions;
    let workDaysMonth = workDays15th + workDays16th;
    
    salaryMonth.textContent = `PHP ${totalMonthPay.toFixed(2)}`;
    salaryMonthSummary.textContent = `${workDaysMonth} work days, PHP ${totalMonthDeductions.toFixed(2)} total deductions.`;

    // 5. Monthly History
    const history = getMonthlyHistory();
    if (history.length === 0) {
        salaryHistoryBody.innerHTML = `
            <tr><td colspan="6" class="px-6 py-4 text-center text-slate-500">No history available yet.</td></tr>
        `;
    } else {
        salaryHistoryBody.innerHTML = history.map(([monthKey, data]) => {
            const [y, m] = monthKey.split('-');
            const dateObj = new Date(y, m - 1, 1);
            const monthName = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
            
            const actualPayDisplay = data.actualNetPay ? `PHP ${parseFloat(data.actualNetPay).toFixed(2)}` : 'Set Amount';
            const actualPayClass = data.actualNetPay ? 'text-primary-600 font-bold' : 'text-slate-400 italic';

            return `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td class="px-3 py-2 text-[11px] font-medium text-slate-900 dark:text-slate-100">${monthName}</td>
                    <td class="px-2 py-2 text-[11px] text-right text-slate-800 dark:text-slate-200">${data.workDays}</td>
                    <td class="px-2 py-2 text-[11px] text-right text-slate-800 dark:text-slate-200">${data.hours.toFixed(2)}</td>
                    <td class="px-2 py-2 text-[11px] text-right text-red-600 dark:text-red-400 font-medium">-${data.deductions.toFixed(2)}</td>
                    <td class="px-2 py-2 text-[11px] text-right text-green-600 dark:text-green-400 font-bold">PHP ${data.pay.toFixed(2)}</td>
                    <td class="px-3 py-2 text-[11px] text-right">
                        <button class="edit-actual-pay-btn flex items-center justify-end w-full ${actualPayClass}" data-month="${monthKey}" data-current="${data.actualNetPay || ''}">
                            ${actualPayDisplay}
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ml-1 text-slate-400 dark:text-slate-500"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        document.querySelectorAll('.edit-actual-pay-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const monthKey = btn.dataset.month;
                const currentVal = btn.dataset.current;
                const [y, m] = monthKey.split('-');
                const dateObj = new Date(y, m - 1, 1);
                const monthName = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });

                const inputHtml = `
                    <p class="mb-2 dark:text-slate-300">Enter the actual net pay received for <strong>${monthName}</strong>:</p>
                    <input type="number" id="modal-input-salary" step="0.01" class="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-2xl shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-primary-500 focus:border-primary-500" value="${currentVal}" placeholder="0.00">
                    ${currentVal ? `<button type="button" onclick="document.getElementById('modal-input-salary').value = ''" class="mt-3 text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400 font-semibold flex items-center gap-1 transition-colors outline-none"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Clear </button>` : ''}
                `;

                showModal('Set Actual Net Pay', inputHtml, 'confirm', () => {
                    const inputVal = document.getElementById('modal-input-salary').value;
                    
                    if (inputVal && inputVal.trim() !== '') {
                        if (!monthlyData[monthKey]) monthlyData[monthKey] = {};
                        monthlyData[monthKey].actualNetPay = parseFloat(inputVal);
                    } else {
                        // NEW LOGIC: If the input is empty, delete the record completely!
                        if (monthlyData[monthKey]) {
                            delete monthlyData[monthKey].actualNetPay;
                        }
                    }
                    
                    saveMonthlyData();
                    renderSalaryPage(); 
                });
                
                setTimeout(() => document.getElementById('modal-input-salary')?.focus(), 200);
            });
        });
    }
};

// --- STATUS MANAGER UI ---
// --- STATUS MANAGER UI ---
const renderStatusList = () => {
    const list = document.getElementById('settings-status-list');
    if (!list) return;

    list.innerHTML = settings.statuses.map((s, index) => {
        // Generate beautiful little indicator badges
        const paidBadge = s.isPaid ? '<span class="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded uppercase">Paid</span>' : '<span class="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded uppercase">Unpaid</span>';
        const amBadge = s.reqAM ? '<span class="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">AM Log</span>' : '<span class="bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">No AM</span>';
        const pmBadge = s.reqPM ? '<span class="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">PM Log</span>' : '<span class="bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">No PM</span>';
        
        // FIX: The new Gold Multiplier Badge
        const multi = s.payMultiplier || 1.0;
        const multiplierBadge = (s.isPaid && multi !== 1.0) ? `<span class="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">${Math.round(multi * 100)}% Pay</span>` : '';

        return `
        <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-2xl transition-all">
            
            <div class="flex flex-col gap-1 shrink-0">
                <button type="button" onclick="moveStatus(${index}, -1)" class="text-slate-400 hover:text-primary-500"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
                <button type="button" onclick="moveStatus(${index}, 1)" class="text-slate-400 hover:text-primary-500"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
            </div>

            <div class="flex-1 cursor-pointer" onclick="openStatusEditor(${index})">
                <div class="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">${s.name}</div>
                <!-- Inserted the multiplier badge into the layout -->
                <div class="flex flex-wrap gap-1.5 text-[9px] font-bold tracking-wider mt-1">
                    ${paidBadge} ${multiplierBadge} ${amBadge} ${pmBadge}
                </div>
            </div>

            <div class="shrink-0">
                ${s.id !== 'regular' ? `<button type="button" onclick="deleteStatus(${index})" class="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>` : '<div class="w-9"></div>'}
            </div>
        </div>
    `}).join('');
};

window.moveStatus = (index, dir) => {
    if (index + dir < 0 || index + dir >= settings.statuses.length) return;
    const temp = settings.statuses[index];
    settings.statuses[index] = settings.statuses[index + dir];
    settings.statuses[index + dir] = temp;
    renderStatusList();
};

window.deleteStatus = (index) => {
    showModal('Delete Status', `Are you sure you want to delete "${settings.statuses[index].name}"?`, 'confirm', () => {
        settings.statuses.splice(index, 1);
        renderStatusList();
    });
};

// --- NEW: Interactive Status Editor Modal ---
window.openStatusEditor = (index = -1) => {
    const isNew = index === -1;
    // FIX: Set a default 1.0 (100%) multiplier for new statuses
    const s = isNew ? { name: '', isPaid: false, reqAM: true, reqPM: true, payMultiplier: 1.0 } : settings.statuses[index];
    
    const defaultMulti = Math.round((s.payMultiplier || 1.0) * 100);

    const html = `
        <div class="space-y-4">
            <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Status Name</label>
                <input type="text" id="modal-status-name" value="${s.name}" placeholder="e.g. Regular Holiday" class="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500">
            </div>
            
            <div class="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 space-y-3">
                
                <div class="flex items-center justify-between">
                    <div class="text-sm font-semibold dark:text-white">Is this a Paid status?</div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <!-- FIX: Toggling this on/off now also dims/disables the Multiplier input below it! -->
                        <input type="checkbox" id="modal-status-paid" class="sr-only peer" ${s.isPaid ? 'checked' : ''} onchange="document.getElementById('multiplier-container').style.opacity = this.checked ? '1' : '0.4'; document.getElementById('modal-status-multiplier').disabled = !this.checked;">
                        <div class="w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>
                
                <!-- FIX: NEW MULTIPLIER ROW -->
                <div id="multiplier-container" class="flex items-center justify-between mt-3 transition-opacity duration-200 ${s.isPaid ? 'opacity-100' : 'opacity-40'}">
                    <div>
                        <div class="text-sm font-semibold dark:text-white">Pay Rate (%)</div>
                        <div class="text-[10px] text-slate-500">100 = Normal, 200 = Double Pay</div>
                    </div>
                    <div class="flex items-center gap-1">
                        <input type="number" id="modal-status-multiplier" value="${defaultMulti}" min="0" step="10" ${s.isPaid ? '' : 'disabled'} class="w-16 p-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none text-right font-bold focus:border-primary-500 transition-colors">
                        <span class="text-slate-500 dark:text-slate-400 font-bold text-sm">%</span>
                    </div>
                </div>

                <hr class="border-slate-200 dark:border-slate-700">

                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-sm font-semibold dark:text-white">Require Morning Log</div>
                        <div class="text-[10px] text-slate-500">User must clock in/out</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="modal-status-am" class="sr-only peer" ${s.reqAM ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                </div>

                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-sm font-semibold dark:text-white">Require Afternoon Log</div>
                        <div class="text-[10px] text-slate-500">User must clock in/out</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="modal-status-pm" class="sr-only peer" ${s.reqPM ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                </div>
            </div>
        </div>
    `;

    showModal(isNew ? 'Create New Status' : 'Edit Status', html, 'confirm', () => {
        const nameVal = document.getElementById('modal-status-name').value.trim();
        if (!nameVal) {
            showToast('Status name cannot be empty', 'error');
            return;
        }

        // FIX: Extract the multiplier back into a decimal (e.g., 200 -> 2.0)
        const multiplierValue = parseFloat(document.getElementById('modal-status-multiplier').value) / 100;

        const updatedStatus = {
            id: isNew ? 'custom_' + Date.now() : s.id,
            name: nameVal,
            isPaid: document.getElementById('modal-status-paid').checked,
            reqAM: document.getElementById('modal-status-am').checked,
            reqPM: document.getElementById('modal-status-pm').checked,
            payMultiplier: isNaN(multiplierValue) ? 1.0 : multiplierValue // Protect against bad inputs
        };

        if (isNew) {
            settings.statuses.push(updatedStatus);
        } else {
            settings.statuses[index] = updatedStatus;
        }
        renderStatusList();
        renderSalaryPage(); // Instantly update dashboard math if a rule changes!
    });
};

// --- PAGE: SETTINGS ---

const renderSettingsPage = () => {

    if (settingQuickConfirm) settingQuickConfirm.checked = settings.requireQuickLogConfirm;
    // Hide save button on fresh load
    if (settingsSaveBtn) settingsSaveBtn.classList.add('hidden');
    if (settingUsername) settingUsername.value = currentUsername; 

    // FIX: Check the toggle if the theme is dark
    if (settingTheme) settingTheme.checked = (settings.theme === 'dark'); 
    
    settingDailySalary.value = settings.dailySalary;
    settingDeduction.value = settings.deductionPerMinute;
    settingMorningLate.value = settings.morningLateThreshold;
    settingAfternoonLate.value = settings.afternoonLateThreshold;
    settingMorningUndertime.value = settings.morningUndertimeThreshold || '12:00';
    settingAfternoonUndertime.value = settings.afternoonUndertimeThreshold || '17:00';
    settingUndertimeDeduction.value = settings.undertimeDeductionPerMinute || 1;
    
    // THIS LINE WAS MISSING: Renders the new Status List UI
    renderStatusList();
};
const handleSettingsSave = (e) => {
    e.preventDefault();


    if (settingUsername && settingUsername.value.trim() !== '') {
        currentUsername = settingUsername.value.trim();
        localStorage.setItem(USERNAME_KEY, currentUsername);
        updateLiveClock(); // Instantly update the greeting in the header!
    }
    
   // FIX: Save 'dark' if checked, 'light' if unchecked
    settings.theme = settingTheme.checked ? 'dark' : 'light';
    settings.dailySalary = parseFloat(settingDailySalary.value) || 0;
    settings.deductionPerMinute = parseFloat(settingDeduction.value) || 0;
    settings.morningLateThreshold = settingMorningLate.value;
    settings.afternoonLateThreshold = settingAfternoonLate.value;
    
    settings.morningUndertimeThreshold = settingMorningUndertime.value;
    settings.afternoonUndertimeThreshold = settingAfternoonUndertime.value;
    settings.undertimeDeductionPerMinute = parseFloat(settingUndertimeDeduction.value) || 0;

    settings.requireQuickLogConfirm = settingQuickConfirm.checked;
    
    applyTheme(settings.theme); 
    saveSettings();
    showToast('Settings saved successfully');

    // Hide button after saving
    if (settingsSaveBtn) settingsSaveBtn.classList.add('hidden');
    
    renderSalaryPage();
    renderLogsTable();
    renderStatistics();
    updateDeeryAvatar();
};


// --- SMART NOTIFICATION ENGINE (UPGRADED) ---

const NOTIF_KEY = 'dtrAppNotifications';
let notifications = [];

// 1. Core State & Persistence (With Auto-Cleanup)
const loadNotifications = () => {
    const data = localStorage.getItem(NOTIF_KEY);
    let loadedNotifs = data ? JSON.parse(data) : [];

    // NEW: Daily Housekeeper Logic
    const todayStr = getISODate(new Date());

    notifications = loadedNotifs.filter(n => {
        // Convert the timestamp back to your local YYYY-MM-DD format
        const notifDateStr = getISODate(new Date(n.timestamp));
        
        // RULE: Keep it if it is UNREAD, OR if it was created TODAY.
        // Destroy it if it is READ and from YESTERDAY (or older).
        return !n.read || notifDateStr === todayStr;
    });

   // If the housekeeper deleted anything, save the newly cleaned list right away!
    if (notifications.length !== loadedNotifs.length) {
        saveNotifications();
    }
};

const saveNotifications = () => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
};

// 2. Add Notification (With Spam Protection & Push)
const addNotification = (title, message, type = 'info', tag = null) => {
    const todayStr = getISODate(new Date());
    
    // SPAM PROTECTION: Don't add if a notification with this tag was already triggered today
    if (tag && notifications.some(n => n.tag === tag && n.timestamp.startsWith(todayStr))) {
        return; 
    }

    const notif = {
        id: Date.now(),
        title,
        message,
        type,
        tag,
        read: false,
        timestamp: new Date().toISOString()
    };

    notifications.unshift(notif); // Add to top
    saveNotifications();
    renderNotifications();
    
    // OPTIONAL: Trigger Browser Push Notification
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body: message, icon: "Expressions/Deery_Normal.png" });
    }
};

// 3. UI Updates (Badge & List)
const updateNotificationBadge = () => {
    const unreadCount = notifications.filter(n => !n.read).length;

    if (unreadCount > 0) {
        notificationBadge.classList.remove('hidden');
        notificationClearedIndicator.classList.add('hidden');
        clearNotificationsBtn.classList.remove('hidden');
    } else {
        notificationBadge.classList.add('hidden');
        notificationClearedIndicator.classList.remove('hidden');
        clearNotificationsBtn.classList.add('hidden');
    }
};

const renderNotifications = () => {
    updateNotificationBadge();

    if (notifications.length === 0) {
        notificationList.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full min-h-[250px] text-slate-400 dark:text-slate-500 animate-slideUpFade">
                <div class="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <p class="text-sm font-semibold text-slate-600 dark:text-slate-300">You're all caught up!</p>
                <p class="text-xs mt-1">No new alerts or reminders.</p>
            </div>
        `;
        return;
    }

    // Icon & Color Dictionary
    const styles = {
        info: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>` },
        warning: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>` },
        danger: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="18" y1="8" x2="23" y2="13"></line><line x1="23" y1="8" x2="18" y2="13"></line></svg>` },
        success: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>` }
    };

    notificationList.innerHTML = notifications.map(n => {
        const style = styles[n.type] || styles.info;
        const opacityClass = n.read ? 'opacity-50' : 'opacity-100';
        const unreadDot = n.read ? '' : `<div class="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full"></div>`;
        
        // Format time nicely
        const timeString = new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        return `
            <div onclick="markAsRead(${n.id})" class="relative notification-card p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex gap-4 items-start cursor-pointer hover:shadow-md transition-all duration-300 ${opacityClass}">
                ${unreadDot}
                <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${style.bg} ${style.text}">
                    ${style.icon}
                </div>
                <div class="flex-1 pr-3">
                    <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200">${n.title}</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">${n.message}</p>
                    <div class="text-[9px] text-slate-400 mt-2 font-medium tracking-wider">${timeString}</div>
                </div>
            </div>
        `;
    }).join('');
};

// 4. Mark Read / Clear
window.markAsRead = (id) => {
    const notif = notifications.find(n => n.id === id);
    if (notif && !notif.read) {
        notif.read = true;
        saveNotifications();
        renderNotifications();
    }
};

const handleClearNotifications = () => {
    // "Clear All" now marks all as read, rather than deleting them
    notifications.forEach(n => n.read = true);
    saveNotifications();
    renderNotifications();
};

const toggleNotificationPanel = () => {
    const isClosed = notificationPanel.classList.contains('translate-x-full');
    if (isClosed) {
        notificationOverlay.classList.remove('hidden');
        renderNotifications(); 
        requestAnimationFrame(() => {
            notificationOverlay.classList.remove('opacity-0');
            notificationPanel.classList.remove('translate-x-full');
        });
    } else {
        notificationPanel.classList.add('translate-x-full');
        notificationOverlay.classList.add('opacity-0');
        setTimeout(() => notificationOverlay.classList.add('hidden'), 300);
    }
};

// 5. Smart Triggers (Runs in background)
const runSmartTriggers = () => {
    const today = new Date();
    const todayStr = getISODate(today);
    const currentHour = today.getHours();
    
    // A. Ask for push permission
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }

    if (!isWorkDay(todayStr)) return;

    const log = getLog(todayStr);
    const statusId = log ? (log.status || 'regular') : 'regular';
    const statusObj = settings.statuses.find(s => s.id === statusId) || settings.statuses[0];

    // B. Missing Morning In Reminder (Triggers after 9 AM if AM log is required)
    if (statusObj.reqAM && currentHour >= 9 && (!log || !log.morningIn)) {
        addNotification("Morning In Reminder", "Don't forget to log your Morning In time!", "info", "missing_am_log");
    }

    // C. Late Warning
    if (log && log.morningIn && isLate(log.morningIn, settings.morningLateThreshold)) {
        addNotification("Late Alert", "You clocked in late this morning. Watch your deductions!", "warning", "late_alert_am");
    }

    // D. Daily Salary Summary (Triggers after 5 PM if shift is complete)
    if (log && currentHour >= 17) {
        const amDone = !statusObj.reqAM || (log.morningIn && log.morningOut);
        const pmDone = !statusObj.reqPM || (log.afternoonIn && log.afternoonOut);
        if (amDone && pmDone) {
            const { pay, deductions } = calculateSalaryForDay(log, todayStr);
            addNotification("Shift Completed", `Great job today! You earned an estimated PHP ${pay.toFixed(2)} with PHP ${deductions.toFixed(2)} in deductions.`, "success", "daily_summary");
        }
    }
};



// --- INITIALIZATION ---

const checkForgotClockOut = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = getISODate(yesterday);
    const yLog = getLog(yStr);
    
    if (isWorkDay(yStr) && yLog) {
        const yStatus = yLog.status || 'regular';
        // Only trigger warning on Regular or WFH days
        if ((yStatus === 'regular' || yStatus === 'wfh') && yLog.morningIn && !yLog.afternoonOut) {
            const dateReadable = formatDateReadable(yStr);
            showModal(
                'Forgot to Clock Out?',
                `<p class="mb-2">It looks like you clocked in on <b>${dateReadable}</b> but didn't clock out in the afternoon.</p><p>Would you like to fix this now?</p>`,
                'confirm',
                () => { editorDate.value = yStr; showPage('editor'); }
            );
        }
    }
};

// --- STORY GENERATOR ENGINE ---
const storyBackdrop = document.getElementById('story-modal-backdrop');
const storyCaptureArea = document.getElementById('story-capture-area');
const storyDate = document.getElementById('story-date');
const storyTitle = document.getElementById('story-title');
const storyContentArea = document.getElementById('story-content-area');

window.openStoryModal = () => {
    storyBackdrop.classList.remove('hidden');
    requestAnimationFrame(() => storyBackdrop.classList.remove('opacity-0'));
    renderStoryVariation('summary'); // Default view
};

window.closeStoryModal = () => {
    storyBackdrop.classList.add('opacity-0');
    setTimeout(() => storyBackdrop.classList.add('hidden'), 300);
};

window.renderStoryVariation = (type) => {
    // UI Tab highlighting
    document.querySelectorAll('.story-tab').forEach(tab => {
        tab.classList.remove('bg-white', 'text-slate-900');
        tab.classList.add('bg-white/10', 'text-white');
    });
    
    // FIX: Safely select the active tab without relying on the global 'event'
    const activeTab = document.querySelector(`.story-tab[onclick*="${type}"]`);
    if (activeTab) {
        activeTab.classList.remove('bg-white/10', 'text-white');
        activeTab.classList.add('bg-white', 'text-slate-900');
    }

    // Gather Today's Data
    const today = new Date();
    const todayStr = getISODate(today);
    const log = getLog(todayStr);
    
    // Set formatted Date
    storyDate.textContent = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    let html = '';

    if (type === 'summary') {
        storyTitle.innerHTML = "Workday<br>Insights";
        const hours = log ? calculateHours(log) : "0.00";
        const mIn = log && log.morningIn ? formatTime12Hour(log.morningIn) : "--:--";
        const aOut = log && log.afternoonOut ? formatTime12Hour(log.afternoonOut) : "--:--";

        html = `
            <div class="text-[15px] sm:text-base mb-1 tracking-wide">
                <span class="font-extrabold text-white">Total Hours Worked :</span> 
                <span class="text-slate-300">${hours} hrs</span>
            </div>
            <div class="text-[13px] sm:text-sm text-slate-400 font-medium tracking-wide">
                Time In ${mIn} &nbsp;&bull;&nbsp; Time Out ${aOut}
            </div>
        `;
    }
    else if (type === 'earnings') {
        storyTitle.innerHTML = "Daily<br>Earnings";
        const salary = calculateSalaryForDay(log, todayStr);
        
        html = `
            <div class="text-[13px] sm:text-sm text-slate-400 font-medium tracking-wide mb-1">You earned today</div>
            <div class="text-4xl sm:text-5xl font-extrabold text-green-400 mb-6 drop-shadow-md tracking-tight">₱ ${salary.pay.toFixed(2)}</div>
            
            <div class="bg-white/5 border border-white/10 rounded-2xl p-4 inline-block backdrop-blur-sm">
                <div class="text-[11px] sm:text-xs text-red-300 font-bold uppercase tracking-widest mb-1">Deductions</div>
                <div class="text-lg font-bold text-white">- ₱ ${salary.deductions.toFixed(2)}</div>
            </div>
        `;
    }
    else if (type === 'consistency') {
        storyTitle.innerHTML = "Weekly<br>Streak";
        
        // Calculate Week Stats
        let daysLogged = 0;
        let lates = 0;
        for(let i=0; i<7; i++) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const dStr = getISODate(d);
            if (isWorkDay(dStr)) {
                const l = getLog(dStr);
                if (l && calculateHours(l) > 0) daysLogged++;
                if (l && (isLate(l.morningIn, settings.morningLateThreshold) || isLate(l.afternoonIn, settings.afternoonLateThreshold))) lates++;
            }
        }

        html = `
            <div class="flex items-center gap-4 mb-6">
                <div class="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <div>
                    <div class="text-2xl font-extrabold text-white">${daysLogged} Days</div>
                    <div class="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">Logged this week</div>
                </div>
            </div>
            
            <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl ${lates === 0 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'} flex items-center justify-center border">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                    <div class="text-2xl font-extrabold text-white">${lates} Lates</div>
                    <div class="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">Recorded this week</div>
                </div>
            </div>
        `;
    }
    else if (type === 'alert') {
        storyTitle.innerHTML = "Daily<br>Status";
        const lateMin = log ? calculateLateMinutes(log) : 0;
        const underMin = log ? calculateUndertimeMinutes(log) : 0;
        const totalAlerts = lateMin + underMin;

        if (totalAlerts > 0) {
            html = `
                <div class="text-rose-400 text-lg font-bold mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    Attention Needed
                </div>
                ${lateMin > 0 ? `<div class="text-[15px] sm:text-base text-slate-300 tracking-wide mb-1">Late today: <span class="font-bold text-white">${lateMin} mins</span></div>` : ''}
                ${underMin > 0 ? `<div class="text-[15px] sm:text-base text-slate-300 tracking-wide">Undertime: <span class="font-bold text-white">${underMin} mins</span></div>` : ''}
            `;
        } else if (log && calculateHours(log) >= 8) {
            html = `
                <div class="text-green-400 text-lg font-bold mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    Perfect Attendance!
                </div>
                <div class="text-[15px] sm:text-base text-slate-300 tracking-wide">No lates or undertimes recorded today. Great job!</div>
            `;
        } else {
             html = `
                <div class="text-slate-400 text-[15px] sm:text-base tracking-wide">Shift is still ongoing or incomplete. Finish your logs to see status!</div>
            `;
        }
    }

    storyContentArea.innerHTML = html;
};

window.downloadStory = () => {
    // Show a loading toast
    showToast("Generating high-res image...", "info");
    
    // Temporarily remove border-radius so the saved PNG has perfectly square corners
    storyCaptureArea.classList.remove('rounded-2xl');

   html2canvas(storyCaptureArea, {
        scale: 3, 
        backgroundColor: null,  // FIX: This tells the camera to capture a transparent background!
        useCORS: true, 
        allowTaint: true,       
        imageTimeout: 5000,     
        logging: true           
    }).then(canvas => {
        // Put the rounded corners back on the UI preview
        storyCaptureArea.classList.add('rounded-2xl');
        
        // FIX: Bulletproof Download Trigger (Works on all browsers/devices)
        const link = document.createElement('a');
        link.download = `Deery_Story_${getISODate(new Date())}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link); // Required for Firefox/Safari
        link.click();
        document.body.removeChild(link); // Clean up after download
        
        showToast("Story exported to your gallery!", "success");
    }).catch(err => {
        storyCaptureArea.classList.add('rounded-2xl');
        showToast("Error generating image.", "danger");
        console.error("Story Export Error:", err);
    });
};

const attachEventListeners = () => {
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // If clicking the Add button manually, force reset to Today
            if (link.dataset.page === 'editor') {
                editorDate.value = getISODate(new Date());
            }
            showPage(link.dataset.page);
        });
    });
    const goToSalaryBtn = document.getElementById('go-to-salary');
    if(goToSalaryBtn) goToSalaryBtn.addEventListener('click', () => showPage('salary'));

    modalCloseBtn.addEventListener('click', hideModal);
    modalBackdrop.addEventListener('click', hideModal);
    modalCancelBtn.addEventListener('click', hideModal);
    modalConfirmBtn.addEventListener('click', () => {
        if (modalConfirmCallback) {
            modalConfirmCallback();
        }
        hideModal();
    });

    toggleDataViewBtn.addEventListener('click', () => switchMasterView('data'));
    toggleAnalyticsViewBtn.addEventListener('click', () => switchMasterView('analytics'));

    notificationBtn.addEventListener('click', toggleNotificationPanel);
    clearNotificationsBtn.addEventListener('click', handleClearNotifications);
    closeNotificationsBtn.addEventListener('click', toggleNotificationPanel);
    notificationOverlay.addEventListener('click', toggleNotificationPanel);

    editorForm.addEventListener('submit', handleEditorSave);
    editorDate.addEventListener('change', loadLogForEditing);
    editorDeleteBtn.addEventListener('click', handleEditorDelete);
    bulkApplyForm.addEventListener('submit', handleBulkApply);
    
    logsTableBody.addEventListener('click', handleTableClick);
    
    viewToggleTable.addEventListener('click', () => switchViewMode('table'));
    viewToggleCalendar.addEventListener('click', () => switchViewMode('calendar'));
    
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', handleFileImport);
    export15thBtn.addEventListener('click', () => handleExport('15th'));
    exportMonthBtn.addEventListener('click', () => handleExport('month'));
    exportAllBtn.addEventListener('click', () => handleExport('all'));
    clearAllBtn.addEventListener('click', clearAllData);
    
    backupJsonBtn.addEventListener('click', handleJsonBackup);
    restoreJsonBtn.addEventListener('click', () => restoreJsonInput.click());
    restoreJsonInput.addEventListener('change', handleJsonRestore);
    
    settingsForm.addEventListener('submit', handleSettingsSave);

    // Unhide save button when user types or changes any setting
    settingsForm.addEventListener('input', (e) => {
        if (e.target.id === 'setting-theme') return; // FIX: Ignore the dark mode toggle
        if (settingsSaveBtn) settingsSaveBtn.classList.remove('hidden');
    });
    settingsForm.addEventListener('change', (e) => {
        if (e.target.id === 'setting-theme') return; // FIX: Ignore the dark mode toggle
        if (settingsSaveBtn) settingsSaveBtn.classList.remove('hidden');
    });
    
  // FIX: Instantly preview and auto-save theme when toggle changes
    settingTheme.addEventListener('change', (e) => {
        e.stopPropagation(); // FIX: This stops the main form from noticing the change!
        
        const selectedTheme = e.target.checked ? 'dark' : 'light';
        applyTheme(selectedTheme);
        
        // Auto-save the choice immediately so it remembers!
        settings.theme = selectedTheme;
        saveSettings();
    });
};

const init = () => {
    loadSettings();
    loadMonthlyData(); 
    loadLogs();
    
    // NEW: Load saved notifications
    loadNotifications(); 
    
    checkOnboarding(); 

    attachEventListeners();
   // Make Avatar Clickable for Random Motivation (and Sleeping Interruptions!)
    if (mainDeeryImg) {
        mainDeeryImg.classList.add('cursor-pointer');
        
        let sleepTimer; // Prevents glitching if you spam click him

        mainDeeryImg.addEventListener('click', () => {
             // Use window.debugHour if testing, otherwise use real time
             const currentHour = window.debugHour !== undefined ? window.debugHour : new Date().getHours();
             
             // Check if it's his strict sleeping hours (10:00 PM to 4:59 AM)
             if (currentHour >= 22 || currentHour <= 4) {
                 clearTimeout(sleepTimer);
                 
                 // 1. Change to the wake-up avatar
                 mainDeeryImg.src = 'Expressions/Deery_wakeup.png';
                 if (headerDeeryImg) headerDeeryImg.src = 'Expressions/Deery_wakeup.png';
                 
                 // 2. Say a random grumpy message (stays on screen for 3 seconds)
                 speakDeery(getRandomDeeryMessage('sleepy_disturbed'), 4000);
                 
                 // 3. Go back to sleep after 2.5 seconds
                 sleepTimer = setTimeout(() => {
                     updateDeeryAvatar(); // This naturally resets him to Deery_Sleeping.png
                 }, 4500);
                 
             } else {
                 // Normal motivation during the day!
                 speakDeery(getRandomDeeryMessage('motivation'), 4500);
             }
        });
    }
    attachSwipeNavigation(); 
    setupDateFilters(); 
    renderNotifications();
    showPage('home'); 
    
    updateLiveClock();
    updateDeeryAvatar(); 
    setInterval(updateLiveClock, 1000);
    
    // NEW: Run smart triggers immediately on load
    runSmartTriggers();
    
    // NEW: Start the background scheduler (Runs every 10 minutes)
    setInterval(() => {
        runSmartTriggers();
    }, 10 * 60 * 1000);
    
    setTimeout(checkForgotClockOut, 1000); 

   
};

document.addEventListener('DOMContentLoaded', init);

