"use strict";

// استخدام رابط النشر الجديد
const API_URL = "https://script.google.com/macros/s/AKfycbzQj6Y11vp37WHSK9CgbULckuCTn1rfq0dN1DUbQuW989WVIvozIlp3jPWObynazN5x/exec";

// دوال مساعدة لعرض رسائل الخطأ/النجاح باستخدام SweetAlert2
function showErrorToast(msg) {
  Swal.fire({
    icon: 'error',
    title: 'خطأ',
    text: msg,
    confirmButtonText: 'حسناً'
  });
}

function showSuccessToast(msg) {
  Swal.fire({
    icon: 'success',
    title: 'نجاح',
    text: msg,
    confirmButtonText: 'حسناً'
  });
}

// ================================
// البحث عن حاج
// ================================
function searchPilgrim() {
  const passportEl = document.getElementById("passport");
  if (!passportEl) return;
  const passport = passportEl.value.trim();
  if (!passport) {
    const msgEl = document.getElementById("searchMessage");
    if (msgEl) msgEl.textContent = "يرجى إدخال رقم الجواز للبحث.";
    return;
  }
  const searchUrl = `${API_URL}?action=searchPilgrim&passport=${encodeURIComponent(passport)}`;
  fetch(searchUrl)
    .then(response => response.json())
    .then(data => {
      const pilgrimCard = document.getElementById("pilgrimCard");
      const pilgrimInfo = document.getElementById("pilgrimInfo");
      if (data.length > 0) {
        if (pilgrimCard) pilgrimCard.classList.remove("d-none");
        if (pilgrimInfo) {
          const p = data[0];
          pilgrimInfo.innerHTML = `
            <table class="table table-bordered mb-0 text-center fade-in">
              <tbody>
                <tr><th>المنشأة</th><td>${p["المنشأة"]}</td></tr>
                <tr><th>الفندق</th><td>${p["الفندق"]}</td></tr>
                <tr><th>اسم الحاج</th><td>${p["اسم الحاج"]}</td></tr>
                <tr><th>رقم الجواز</th><td>${p["رقم الجواز"]}</td></tr>
                <tr><th>الجنس</th><td>${p["الجنس"]}</td></tr>
                <tr><th>العمر</th><td>${p["العمر"]}</td></tr>
                <tr><th>المرض المزمن</th><td>${p["المرض المزمن"]}</td></tr>
                <tr><th>اسم العلاج المستخدم</th><td>${p["اسم العلاج المستخدم"]}</td></tr>
              </tbody>
            </table>
          `;
          const hiddenPassport = document.getElementById("hiddenPassport");
          if (hiddenPassport) hiddenPassport.value = p["رقم الجواز"];
        }
        checkReportStatus(passport);
        const msgEl = document.getElementById("searchMessage");
        if (msgEl) msgEl.textContent = "";
      } else {
        const msgEl = document.getElementById("searchMessage");
        if (msgEl) msgEl.textContent = "لم يتم العثور على الحاج بهذا الرقم.";
        if (pilgrimCard) pilgrimCard.classList.add("d-none");
      }
    })
    .catch(error => {
      console.error("خطأ أثناء البحث:", error);
      showErrorToast("حدث خطأ أثناء البحث.");
    });
}

// ================================
// التحقق من وجود تقرير (يمكنك التعديل حسب الحاجة)
// ================================
function checkReportStatus(passport) {
  const reportUrl = `${API_URL}?action=getReport&passport=${encodeURIComponent(passport)}`;
  fetch(reportUrl)
    .then(response => response.json())
    .then(data => {
      console.log("حالة التقرير:", data);
    })
    .catch(error => {
      console.error("خطأ أثناء التحقق من التقرير:", error);
    });
}

// ================================
// فتح نافذة إضافة بيانات علاجية وضبط التاريخ والوقت تلقائيًا
// ================================
function openModal() {
  const modalEl = document.getElementById("addDataModal");
  if (modalEl) {
    const now = new Date();
    const dateInput = document.getElementById("treatmentDate");
    const timeInput = document.getElementById("treatmentTime");
    if (dateInput) {
      dateInput.value = now.toISOString().slice(0, 10);
    }
    if (timeInput) {
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      timeInput.value = `${hours}:${minutes}`;
    }
    handleExternalTransferChange();
    new bootstrap.Modal(modalEl).show();
  }
}

// ================================
// إظهار/إخفاء حقول التحويل الخارجي
// ================================
function handleExternalTransferChange() {
  const externalTransfer = document.getElementById("externalTransfer");
  const hospitalFields = document.getElementById("hospitalFields");
  if (!externalTransfer || !hospitalFields) return;
  if (externalTransfer.value === "نعم") {
    hospitalFields.style.display = "block";
    const now = new Date();
    const dateValue = now.toISOString().slice(0, 10);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById("externalTransferDate").value = dateValue;
    document.getElementById("externalTransferTime").value = `${hours}:${minutes}`;
  } else {
    hospitalFields.style.display = "none";
    document.getElementById("hospitalName").value = "";
    document.getElementById("externalTransferDate").value = "";
    document.getElementById("externalTransferTime").value = "";
    document.getElementById("diseaseStatus").value = "";
  }
}

// ================================
// حفظ البيانات العلاجية
// ================================
function saveTreatmentData() {
  const hiddenPassportEl = document.getElementById("hiddenPassport");
  if (!hiddenPassportEl) return;
  const passport = hiddenPassportEl.value;
  const doctorName = document.getElementById("doctorName")?.value || "";
  const treatmentHotel = document.getElementById("treatmentHotel")?.value || "";
  const treatmentDate = document.getElementById("treatmentDate")?.value || "";
  const treatmentTime = document.getElementById("treatmentTime")?.value || "";
  const conservatory = document.getElementById("conservatory")?.value || "";
  const maritalStatus = document.getElementById("maritalStatus")?.value || "";
  const diseaseType = document.getElementById("diseaseType")?.value || "";
  const diagnosis = document.getElementById("diagnosis")?.value || "";
  const prescription = document.getElementById("prescription")?.value || "";
  const treatmentDispensing = document.getElementById("treatmentDispensing")?.value || "";
  const externalTransfer = document.getElementById("externalTransfer")?.value || "";
  const hospitalName = document.getElementById("hospitalName")?.value || "";
  const externalTransferDate = document.getElementById("externalTransferDate")?.value || "";
  const externalTransferTime = document.getElementById("externalTransferTime")?.value || "";
  const dStatus = document.getElementById("diseaseStatus")?.value || "";
  const additionalNotes = document.getElementById("additionalNotes")?.value || "";
  
  if (!passport || !doctorName || !treatmentHotel || !treatmentDate || !treatmentTime ||
      !conservatory || !maritalStatus || !diseaseType || !diagnosis || !prescription || !treatmentDispensing) {
    showErrorToast("يرجى ملء جميع الحقول المطلوبة.");
    return;
  }
  
  const searchUrl = `${API_URL}?action=searchPilgrim&passport=${encodeURIComponent(passport)}`;
  fetch(searchUrl)
    .then(response => response.json())
    .then(result => {
      if (result.length > 0) {
        const formData = new URLSearchParams();
        formData.append("action", "updatePilgrim");
        formData.append("passport", passport);
        formData.append("doctorName", doctorName);
        formData.append("treatmentHotel", treatmentHotel);
        formData.append("treatmentDate", treatmentDate);
        formData.append("treatmentTime", treatmentTime);
        formData.append("conservatory", conservatory);
        formData.append("maritalStatus", maritalStatus);
        formData.append("diseaseType", diseaseType);
        formData.append("diagnosis", diagnosis);
        formData.append("prescription", prescription);
        formData.append("treatmentDispensing", treatmentDispensing);
        formData.append("externalTransfer", externalTransfer);
        formData.append("hospitalName", hospitalName);
        formData.append("externalTransferDate", externalTransferDate);
        formData.append("externalTransferTime", externalTransferTime);
        formData.append("diseaseStatus", dStatus);
        formData.append("additionalNotes", additionalNotes);
        
        const updateUrl = `${API_URL}?${formData.toString()}`;
        fetch(updateUrl)
          .then(response => response.json())
          .then(data => {
            showSuccessToast(data.message || "تم حفظ البيانات بنجاح.");
            const modalEl = document.getElementById("addDataModal");
            if (modalEl) new bootstrap.Modal(modalEl).hide();
            checkReportStatus(passport);
            localStorage.removeItem("treatmentFormData");
          })
          .catch(error => {
            console.error("Update error:", error);
            showErrorToast("حدث خطأ أثناء تحديث البيانات.");
          });
      } else {
        showErrorToast("لم يتم العثور على الحاج!");
      }
    })
    .catch(error => {
      console.error("Search error:", error);
      showErrorToast("حدث خطأ أثناء البحث لتحديث البيانات.");
    });
}

// ================================
// دالة تصدير التقرير إلى PDF باستخدام html2pdf مع حل DataTables الاحترافي
// ================================
function exportReportPDF(elementId, tableSelector) {
  const element = document.getElementById(elementId);
  if (!element) {
    showErrorToast("لا توجد بيانات لتصديرها إلى PDF.");
    return;
  }
  let dtInstance = null;
  if (tableSelector) {
    dtInstance = $(tableSelector).DataTable();
    dtInstance.destroy();
  }
  // إزالة تأثير الـ table-responsive مؤقتًا
  element.classList.remove("table-responsive");
  element.style.overflow = "visible";
  element.style.width = "auto";
  
  html2pdf().set({
    margin: 5,
    filename: 'report.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, windowWidth: 2000 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  }).from(element).save().then(() => {
    // إعادة تفعيل الـ table-responsive
    element.classList.add("table-responsive");
    element.style.overflow = "";
    element.style.width = "";
    if (tableSelector) {
      $(tableSelector).DataTable({
        paging: true,
        searching: true,
        autoWidth: true,
        responsive: true
      });
    }
  });
}

// ================================
// دوال تقارير DataTables والتقارير المختلفة
// ================================
function fetchTransferredReport() {
  const filterInstitution = document.getElementById("filterInstitutionTransferred").value.trim();
  const filterHotel = document.getElementById("filterHotelTransferred").value.trim();
  const params = new URLSearchParams();
  params.append("action", "getTransferredReport");
  if (filterInstitution) params.append("filterInstitution", filterInstitution);
  if (filterHotel) params.append("filterHotel", filterHotel);
  
  const url = `${API_URL}?${params.toString()}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById("transferredReportContent");
      if (container) {
        if (data.length > 0) {
          container.innerHTML = `<div class="table-responsive" id="transferredTable">` + createTransferredReportTable(data) + `</div>`;
          $('#transferredTable table').DataTable({
            paging: true,
            searching: false,
            autoWidth: true,
            responsive: true
          });
        } else {
          container.innerHTML = `<p class="text-danger">لا توجد حالات محولة.</p>`;
        }
      }
    })
    .catch(error => {
      console.error("خطأ أثناء جلب تقرير الحالات المحولة:", error);
      showErrorToast("حدث خطأ أثناء جلب تقرير الحالات المحولة.");
    });
}

function createTransferredReportTable(data) {
  let html = `<table class="table table-bordered text-center">
    <thead>
      <tr>
        <th>اسم الحاج</th>
        <th>رقم الجواز</th>
        <th>المنشأة</th>
        <th>الفندق</th>
        <th>اسم المستشفى</th>
        <th>حالة المريض</th>
      </tr>
    </thead>
    <tbody>`;
  data.forEach(item => {
    html += `<tr>
      <td>${item["اسم الحاج"] || ""}</td>
      <td>${item["رقم الجواز"] || ""}</td>
      <td>${item["المنشأة"] || ""}</td>
      <td>${item["الفندق"] || ""}</td>
      <td>${item["اسم المستشفى"] || ""}</td>
      <td>${item["حالة المريض"] || ""}</td>
    </tr>`;
  });
  html += `</tbody></table>`;
  return html;
}

function applyDailyReportFilters() {
  const filterInstitution = document.getElementById("filterInstitutionDaily")?.value.trim() || "";
  const filterHotel = document.getElementById("filterHotelDaily")?.value.trim() || "";
  const filterGender = document.getElementById("filterGenderDaily")?.value.trim() || "";
  const filterConservatory = document.getElementById("filterConservatoryDaily")?.value.trim() || "";
  const filterStartDate = document.getElementById("filterStartDateDaily")?.value.trim() || "";
  const filterEndDate = document.getElementById("filterEndDateDaily")?.value.trim() || "";
  
  const params = new URLSearchParams();
  params.append("action", "getDailyReport");
  if (filterInstitution) params.append("filterInstitution", filterInstitution);
  if (filterHotel) params.append("filterHotel", filterHotel);
  if (filterGender) params.append("filterGender", filterGender);
  if (filterConservatory) params.append("filterConservatory", filterConservatory);
  if (filterStartDate) params.append("filterStartDate", filterStartDate);
  if (filterEndDate) params.append("filterEndDate", filterEndDate);
  
  const url = `${API_URL}?${params.toString()}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById("dailyReportContent");
      if (container) {
        if (data.length > 0) {
          let tableHtml = createDailyReportTable(data);
          container.innerHTML = `<div class="table-responsive" id="dailyTable">` + tableHtml + `</div>`;
          $('#dailyTable table').DataTable({
            paging: true,
            searching: false,
            autoWidth: true,
            responsive: true
          });
        } else {
          container.innerHTML = `<p class="text-danger">لا توجد بيانات مطابقة.</p>`;
        }
      }
    })
    .catch(error => {
      console.error("خطأ في تقرير الزوار اليومي:", error);
      showErrorToast("حدث خطأ أثناء جلب تقرير الزوار اليومي.");
    });
}

function createDailyReportTable(data) {
  let html = `<table class="table table-bordered text-center">
    <thead>
      <tr>
        <th>المنشأة</th>
        <th>الفندق</th>
        <th>اسم الحاج</th>
        <th>الجنس</th>
        <th>العمر</th>
        <th>المرض المزمن</th>
        <th>اسم الطبيب</th>
        <th>التاريخ</th>
        <th>المحافظة</th>
        <th>الحالة الاجتماعية</th>
        <th>الحالة المرضية</th>
        <th>تحويل خارجي</th>
        <th>اسم المستشفى</th>
        <th>تاريخ التحويل</th>
        <th>حالة المريض</th>
      </tr>
    </thead>
    <tbody>`;
  data.forEach(row => {
    html += `<tr>
      <td>${row["المنشأة"] || ""}</td>
      <td>${row["الفندق"] || ""}</td>
      <td>${row["اسم الحاج"] || ""}</td>
      <td>${row["الجنس"] || ""}</td>
      <td>${row["العمر"] || ""}</td>
      <td>${row["المرض المزمن"] || ""}</td>
      <td>${row["اسم الطبيب"] || ""}</td>
      <td>${row["التاريخ"] || ""}</td>
      <td>${row["المحافظة"] || ""}</td>
      <td>${row["الحالة الاجتماعية"] || ""}</td>
      <td>${row["الحالة المرضية"] || ""}</td>
      <td>${row["تحويل خارجي"] || ""}</td>
      <td>${row["اسم المستشفى"] || ""}</td>
      <td>${row["تاريخ التحويل"] || ""}</td>
      <td>${row["حالة المريض"] || ""}</td>
    </tr>`;
  });
  html += `</tbody></table>`;
  return html;
}

function fetchPatientReport() {
  const patientPassportEl = document.getElementById("patientPassport");
  if (!patientPassportEl) return;
  const passport = patientPassportEl.value.trim();
  if (!passport) {
    showErrorToast("يرجى إدخال رقم الجواز.");
    return;
  }
  const url = `${API_URL}?action=getPilgrimDetails&passport=${encodeURIComponent(passport)}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById("patientReportContent");
      if (container) {
        if (data && data.length > 0) {
          container.innerHTML = `<div class="table-responsive" id="patientTable">` + createPatientReportTable(data[0]) + `</div>`;
          $('#patientTable table').DataTable({
            paging: true,
            searching: false,
            autoWidth: true,
            responsive: true
          });
        } else {
          container.innerHTML = `<p class="text-danger">لا توجد بيانات لهذا الحاج.</p>`;
        }
      }
    })
    .catch(error => {
      console.error("خطأ في تقرير الحاج:", error);
      showErrorToast("حدث خطأ أثناء جلب تقرير الحاج.");
    });
}

function createPatientReportTable(row) {
  const hasExternal = (row["تحويل خارجي"] && row["تحويل خارجي"].trim() === "نعم");
  let html = `<table class="table table-bordered text-center">
    <thead>
      <tr>
        <th>المنشأة</th>
        <th>الفندق</th>
        <th>اسم الحاج</th>
        <th>رقم الجواز</th>
        <th>الجنس</th>
        <th>العمر</th>
        <th>المرض المزمن</th>
        <th>اسم العلاج المستخدم</th>
        <th>اسم الطبيب</th>
        <th>الفندق (علاج)</th>
        <th>التاريخ</th>
        <th>الوقت</th>
        <th>المحافظة</th>
        <th>الحالة الاجتماعية</th>
        <th>الحالة المرضية</th>`;
  if (hasExternal) {
    html += `
        <th>تحويل خارجي</th>
        <th>اسم المستشفى</th>
        <th>تاريخ التحويل</th>
        <th>حالة المريض</th>`;
  }
  html += `</tr></thead>
    <tbody>
      <tr>
        <td>${row["المنشأة"] || ""}</td>
        <td>${row["الفندق"] || ""}</td>
        <td>${row["اسم الحاج"] || ""}</td>
        <td>${row["رقم الجواز"] || ""}</td>
        <td>${row["الجنس"] || ""}</td>
        <td>${row["العمر"] || ""}</td>
        <td>${row["المرض المزمن"] || ""}</td>
        <td>${row["اسم العلاج المستخدم"] || ""}</td>
        <td>${row["اسم الطبيب"] || ""}</td>
        <td>${row["الفندق (علاج)"] || ""}</td>
        <td>${row["التاريخ"] || ""}</td>
        <td>${row["الوقت"] || ""}</td>
        <td>${row["المحافظة"] || ""}</td>
        <td>${row["الحالة الاجتماعية"] || ""}</td>
        <td>${row["الحالة المرضية"] || ""}</td>`;
  if (hasExternal) {
    html += `
        <td>${row["تحويل خارجي"] || ""}</td>
        <td>${row["اسم المستشفى"] || ""}</td>
        <td>${row["تاريخ التحويل"] || ""}</td>
        <td>${row["حالة المريض"] || ""}</td>`;
  }
  html += `</tr>
    </tbody>
  </table>`;
  return html;
}

// ================================
// ربط الدوال في النافذة
// ================================
window.searchPilgrim = searchPilgrim;
window.openModal = openModal;
window.saveTreatmentData = saveTreatmentData;
window.handleExternalTransferChange = handleExternalTransferChange;
window.fetchTransferredReport = fetchTransferredReport;
window.applyDailyReportFilters = applyDailyReportFilters;
window.fetchPatientReport = fetchPatientReport;
window.viewReport = viewReport;
window.exportReportPDF = exportReportPDF;
