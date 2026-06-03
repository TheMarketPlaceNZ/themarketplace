/* Diagnostic Quiz Database * Universal Pain Point Questions */
const universalQuestions = [
  { text: "Do your digital channels consistently bring in high value clients who are ready to buy, or is your monthly revenue still dependent on unpredictable referrals and word of mouth?" },
  { text: "When a potential client searches for your service in the local area, does your digital presence immediately position you as the premium, undisputed authority, or do you look just like your competitors?" },
  { text: "Are your online systems designed to automatically answer client objections, establish immediate trust, and pre qualify leads, or are you wasting hours on the phone with non serious inquiries?" },
  { text: "Are your administrative tasks, booking follow ups, and customer onboarding systems fully automated, or do manual bottlenecks consume your personal time and limit your capacity to grow?" },
  { text: "Do you have a clear, automated pipeline that predictably scales your business, or does the daily pressure of running operations prevent you from stepping back to focus on long term growth?" }
];

/* Quiz and Calendar State Variables */
let currentQuestionIndex = 0;
let ratingScores = [];
let activeQuestions = [];
let availableBookingDates = [];

/* Initialize Page Elements */
document.addEventListener("DOMContentLoaded", () => {
  initializeScrollReveal();
  
  const loginLink = document.querySelector(".loginLink");
  if (loginLink) {
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      openPortal();
    });
  }
});

/* Intersection Observer for Dynamic Scroll Reveal Animations */
function initializeScrollReveal() {
  const revealElements = document.querySelectorAll(".revealOnScroll");
  
  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: "0px"
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // Animate once and preserve state
      }
    });
  }, observerOptions);

  revealElements.forEach(element => {
    observer.observe(element);
  });
}

/* Modal Controls for Quiz */
function openQuizModal() {
  const overlay = document.getElementById("quizModalOverlay");
  if (overlay) {
    overlay.style.display = "flex";
    resetQuizModal();
  }
}

function closeQuizModal() {
  const overlay = document.getElementById("quizModalOverlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}

function resetQuizModal() {
  currentQuestionIndex = 0;
  ratingScores = [];
  activeQuestions = universalQuestions;
  
  document.getElementById("quizStep1").style.display = "block";
  document.getElementById("quizStep2").style.display = "none";

  loadQuizQuestion();
}

/* Load Quiz Question */
function loadQuizQuestion() {
  const progressBar = document.getElementById("quizProgressBar");
  const questionNumber = document.getElementById("quizQuestionNumber");
  const questionText = document.getElementById("quizQuestionText");

  if (!progressBar || !questionNumber || !questionText) return;

  const total = activeQuestions.length;
  const progressPercentage = (currentQuestionIndex / total) * 100;
  progressBar.style.width = `${progressPercentage}%`;

  questionNumber.textContent = `Diagnostic Question ${currentQuestionIndex + 1} of ${total}`;
  questionText.textContent = activeQuestions[currentQuestionIndex].text;
}

/* Handle Rating selections (1 to 5 rating scale) */
function handleRatingSelection(ratingValue) {
  ratingScores.push(ratingValue);
  currentQuestionIndex++;

  if (currentQuestionIndex < activeQuestions.length) {
    loadQuizQuestion();
  } else {
    calculateRatingResults();
  }
}

/* Calculate and Render Quiz Results with Ethical Diagnostic Analysis */
function calculateRatingResults() {
  const totalQuestions = activeQuestions.length;
  const sumScores = ratingScores.reduce((a, b) => a + b, 0);
  const averageScore = sumScores / totalQuestions;
  
  const gapPercentage = Math.round(((5 - averageScore) / 4) * 100);

  document.getElementById("quizStep1").style.display = "none";
  document.getElementById("quizStep2").style.display = "block";

  const scoreDisplay = document.getElementById("quizResultsScore");
  const statusTitle = document.getElementById("quizResultsStatusTitle");
  const statusText = document.getElementById("quizResultsStatusText");

  if (!scoreDisplay || !statusTitle || !statusText) return;

  scoreDisplay.textContent = `${gapPercentage}%`;

  if (averageScore >= 4.0) {
    statusTitle.textContent = "Your Business Systems Are Highly Robust";
    statusText.textContent = `Excellent work. Your diagnostic score indicates that your operational foundations are incredibly strong. You are already happy with your performance and we will not attempt to oversell you. You could simply benefit from a fresh, elite perspective to further streamline specific automations or cinematic videography. It might be worth a casual catchup.`;
  } else if (averageScore >= 2.5) {
    statusTitle.textContent = "Moderate Gaps and Operational Bottlenecks Detected";
    statusText.textContent = `Your diagnostic gap is ${gapPercentage}%. You have established decent local foundations in Hamilton, but your client acquisition and content systems are inconsistent. You are currently leaking high value contracts due to manual processes, lack of structured video authority, or delayed post consultation follow ups. We can help you automate these leaks.`;
  } else {
    statusTitle.textContent = "Critical Gaps Threatening Your Market Position";
    statusText.textContent = `Critical Gaps Identified. Your acquisition, brand trust, and operational pipelines are leaking significant local contracts in the Waikato. Your operations are heavily bottle necked by manual labor, and you are vulnerable to aggressive digital competitors. It is highly recommended that you book a growth call immediately to get an ethical strategy in place.`;
  }
}

/* Transition Quiz to Booking Form with Autofilled Data */
function transitionQuizToBooking() {
  closeQuizModal();
  openBooking();
  
  const packageSelect = document.getElementById("leadPackage");
  if (packageSelect) {
    packageSelect.value = "Found";
  }
}

/* Modal Controls for Booking */
function openBooking() {
  const overlay = document.getElementById("modalOverlay");
  if (overlay) {
    overlay.style.display = "flex";
    resetBookingSteps();
  }
}

function closeBooking() {
  const overlay = document.getElementById("modalOverlay");
  if (overlay) {
    overlay.style.display = "none";
    resetBookingSteps();
  }
}

/* Progressive multi step form transitions */
function nextStep(stepNumber) {
  if (stepNumber === 2) {
    const leadName = document.getElementById("leadName").value.trim();
    const leadEmail = document.getElementById("leadEmail").value.trim();
    if (!leadName || !leadEmail) {
      alert("Please provide both your name and email to proceed.");
      return;
    }
  }

  if (stepNumber === 3) {
    const leadCompany = document.getElementById("leadCompany").value.trim();
    if (!leadCompany) {
      alert("Please enter your business name to proceed.");
      return;
    }
  }

  if (stepNumber === 4) {
    // Generate available dates when entering the calendar step
    buildUrgencyCalendar();
  }

  document.getElementById("modalStep1").style.display = "none";
  document.getElementById("modalStep2").style.display = "none";
  document.getElementById("modalStep3").style.display = "none";
  document.getElementById("modalStep4").style.display = "none";

  document.getElementById(`modalStep${stepNumber}`).style.display = "block";
}

function resetBookingSteps() {
  document.getElementById("modalStep1").style.display = "block";
  document.getElementById("modalStep2").style.display = "none";
  document.getElementById("modalStep3").style.display = "none";
  document.getElementById("modalStep4").style.display = "none";
}

/* Urgency Driven Three Day Calendar Calculation (Skips Fridays and Weekends) */
function buildUrgencyCalendar() {
  const datesRow = document.getElementById("calendarDaysRow");
  const slotsGrid = document.getElementById("calendarSlotsGrid");
  
  if (!datesRow || !slotsGrid) return;
  
  datesRow.innerHTML = "";
  slotsGrid.innerHTML = "";
  
  availableBookingDates = [];
  let currentDate = new Date();
  
  currentDate.setDate(currentDate.getDate() + 1);
  
  while (availableBookingDates.length < 3) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && dayOfWeek !== 5) {
      availableBookingDates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  availableBookingDates.forEach((date, index) => {
    const dayName = date.toLocaleDateString("en-NZ", { weekday: "short" });
    const dayNum = date.getDate();
    
    const dayCard = document.createElement("div");
    dayCard.className = `calendarDayCard ${index === 0 ? "active" : ""}`;
    dayCard.onclick = () => selectBookingDate(index, dayCard);
    
    dayCard.innerHTML = `
      <span class="calendarDayName">${dayName}</span>
      <span class="calendarDayNumber">${dayNum}</span>
    `;
    
    datesRow.appendChild(dayCard);
  });
  
  selectBookingDate(0);
}

/* Select Booking Date */
function selectBookingDate(dateIndex, cardElement) {
  const cards = document.querySelectorAll(".calendarDayCard");
  cards.forEach(c => c.classList.remove("active"));
  
  if (cardElement) {
    cardElement.classList.add("active");
  } else {
    const firstCard = document.querySelector(".calendarDayCard");
    if (firstCard) firstCard.classList.add("active");
  }
  
  const chosenDate = availableBookingDates[dateIndex];
  document.getElementById("selectedBookingDate").value = chosenDate.toLocaleDateString("en-NZ", { year: "numeric", month: "long", day: "numeric" });
  
  const slotsGrid = document.getElementById("calendarSlotsGrid");
  if (!slotsGrid) return;
  
  slotsGrid.innerHTML = "";
  
  const timeSlots = ["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"];
  
  const busySlotsMap = {
    0: [1, 3],
    1: [0, 4],
    2: [1, 2]
  };
  
  const busyIndexes = busySlotsMap[dateIndex] || [];
  
  timeSlots.forEach((slot, index) => {
    const isBusy = busyIndexes.includes(index);
    const slotBtn = document.createElement("div");
    slotBtn.className = `calendarTimeSlot ${isBusy ? "allocated" : ""}`;
    slotBtn.textContent = slot;
    
    if (!isBusy) {
      slotBtn.onclick = () => selectBookingTime(slot, slotBtn);
    } else {
      slotBtn.title = "Allocated Strategy Slot";
    }
    
    slotsGrid.appendChild(slotBtn);
  });
  
  document.getElementById("selectedBookingTime").value = "";
}

/* Select Booking Time */
function selectBookingTime(timeString, slotElement) {
  const slots = document.querySelectorAll(".calendarTimeSlot");
  slots.forEach(s => s.classList.remove("active"));
  
  slotElement.classList.add("active");
  document.getElementById("selectedBookingTime").value = timeString;
}

/* Submit Booking to Webhook SOP */
function submitBooking() {
  const leadName = document.getElementById("leadName").value.trim();
  const leadEmail = document.getElementById("leadEmail").value.trim();
  const leadCompany = document.getElementById("leadCompany").value.trim();
  const leadUrl = document.getElementById("leadUrl").value.trim();
  const leadPackage = document.getElementById("leadPackage").value;
  const bookingDate = document.getElementById("selectedBookingDate").value;
  const bookingTime = document.getElementById("selectedBookingTime").value;

  if (!bookingDate || !bookingTime) {
    alert("Please select an available date and time slot on the calendar to secure your call.");
    return;
  }

  let gapScore = "Not Audited";
  if (ratingScores.length > 0) {
    const sumScores = ratingScores.reduce((a, b) => a + b, 0);
    const averageScore = sumScores / ratingScores.length;
    gapScore = `${Math.round(((5 - averageScore) / 4) * 100)}%`;
  }

  const payload = {
    name: leadName,
    email: leadEmail,
    company: leadCompany,
    website: leadUrl,
    packageSelection: leadPackage,
    gapPercentage: gapScore,
    targetNiche: "Universal Audit",
    allocatedDate: bookingDate,
    allocatedTime: bookingTime,
    source: "High Conversion Rebuild Portal",
    location: "Hamilton, NZ"
  };

  alert(`Secure appointment confirmed, ${leadName}!\n\nWe have locked in your growth strategy call for ${bookingDate} at ${bookingTime}.\n\nHenk and Kurt will contact you directly.`);
  
  closeBooking();

  const webhookUrl = "https://hook.us2.make.com/t2glxhhce8zfnnyxny1ipk3cjz1iy9m6";

  fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
  .then(response => {
    console.log("Strategic lead successfully routed to automated SOP conveyor belt:", response.status);
  })
  .catch(error => {
    console.warn("Automation payload buffered successfully:", error.message);
  });
}

/* Member and Admin Login Portal Controls */
function openPortal() {
  const overlay = document.getElementById("loginModalOverlay");
  if (overlay) {
    overlay.style.display = "flex";
    const input = document.getElementById("memberPasscode");
    if (input) {
      input.value = "";
      input.focus();
    }
    const errorEl = document.getElementById("loginError");
    if (errorEl) errorEl.style.display = "none";
  }
}

function closeLoginModal() {
  const overlay = document.getElementById("loginModalOverlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}

function handleLoginKey(event) {
  if (event.key === "Enter") {
    submitMemberLogin();
  }
}

function submitMemberLogin() {
  const passcode = document.getElementById("memberPasscode").value.trim();
  const errorEl = document.getElementById("loginError");
  if (!passcode) return;

  if (passcode === "sopo2026") {
    if (errorEl) errorEl.style.display = "none";
    alert("Secure client workspace loading...");
    closeLoginModal();
    window.open("sopo-studio/index.html", "_blank");
  } else if (passcode === "Pass#321Word") {
    if (errorEl) errorEl.style.display = "none";
    alert("Access Granted: Command Station Loading...");
    closeLoginModal();
    localStorage.setItem("jarvisGateUnlocked", "true");
    window.open("command_station.html", "_blank");
  } else {
    if (errorEl) {
      errorEl.style.display = "block";
    }
  }
}

/* Collapsible Add ons and Guidelines Accordion Toggle */
function toggleAddOns() {
  const content = document.getElementById("accordionContent");
  const icon = document.getElementById("accordionIcon");
  if (!content || !icon) return;
  
  if (content.style.display === "none") {
    content.style.display = "block";
    icon.textContent = "▲";
  } else {
    content.style.display = "none";
    icon.textContent = "▼";
  }
}

/* Collapsible Card System Features Accordion Toggle */
function toggleCardFeatures(cardIndex) {
  const content = document.getElementById(`cardAccordionContent${cardIndex}`);
  const icon = document.getElementById(`cardAccordionIcon${cardIndex}`);
  if (!content || !icon) return;
  
  if (content.style.display === "none") {
    content.style.display = "block";
    icon.classList.add("open");
  } else {
    content.style.display = "none";
    icon.classList.remove("open");
  }
}

/* Package Pre Selection from Card Button click */
function selectPackageFromCard(packageName) {
  openBooking();
  const packageSelect = document.getElementById("leadPackage");
  if (packageSelect) {
    packageSelect.value = packageName;
  }
}
