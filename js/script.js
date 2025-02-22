const API_URL = "https://script.google.com/macros/s/AKfycbzqMUQDOGqbPVCkgULOKUzT2pOGyMC1UpQNFOa9PrppI63lcNArIeAwGk0fPThRDjy_/exec";

// دالة لمركزة تقاويم Flatpickr داخل مودال "إضافة بيانات علاجية"
function centerCalendar(instance) {
  const modalDialog = document.querySelector('#addDataModal .modal-dialog');
  if (!modalDialog) return;
  // التأكد من أن modalDialog يحمل position: relative
  modalDialog.style.position = 'relative';
  const calendar = instance.calendarContainer;
  // تعيين position: absolute ليكون التقويم داخل modalDialog
  calendar.style.position = 'absolute';
  setTimeout(() => {
    const calWidth = calendar.offsetWidth;
    const calHeight = calendar.offsetHeight;
    calendar.style.top = ((modalDialog.offsetHeight - calHeight) / 2) + 'px';
    calendar.style.left = ((modalDialog.offsetWidth - calWidth) / 2) + 'px';
  }, 0);
}

document.addEventListener("DOMContentLoaded", function() {
  // تهيئة Flatpickr لمدخلات التاريخ والوقت داخل المودال باستخدام appendTo لتحديد modal-dialog كحاوية
  flatpickr("#treatmentDate", { 
    locale: "ar", 
    dateFormat: "d-m-Y",
    appendTo: document.querySelector('#addDataModal .modal-dialog'),
    onOpen: function(selectedDates, dateStr, instance) {
      centerCalendar(instance);
    }
  });
  flatpickr("#treatmentTime", { 
    enableTime: true, 
    noCalendar: true, 
    dateFormat: "H:i", 
    time_24hr: true, 
    locale: "ar",
    appendTo: document.querySelector('#addDataModal .modal-dialog'),
    onOpen: function(selectedDates, dateStr, instance) {
      centerCalendar(instance);
    }
  });
  flatpickr("#detailTreatmentDate", { 
    locale: "ar", 
    dateFormat: "d-m-Y" 
  });
  flatpickr("#detailTreatmentTime", { 
    enableTime: true, 
    noCalendar: true, 
    dateFormat: "H:i", 
    time_24hr: true, 
    locale: "ar" 
  });
  
  // آلية auto‑save لنموذج بيانات العلاج
  const treatmentForm = document.getElementById("treatmentForm");
  if (treatmentForm) {
    treatmentForm.addEventListener("input", () => {
      const formData = new FormData(treatmentForm);
      const data = {};
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }
      localStorage.setItem("treatmentFormData", JSON.stringify(data));
    });
    
    const savedData = localStorage.getItem("treatmentFormData");
    if (savedData) {
      const data = JSON.parse(savedData);
      for (let key in data) {
        if (document.getElementById(key)) {
          document.getElementById(key).value = data[key];
        }
      }
    }
  }
});

/* دالة تسجيل الدخول */
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  if (username && password) {
    console.log("محاولة تسجيل الدخول للمستخدم:", username);
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("message").textContent = "يرجى ملء جميع الحقول";
  }
}

/* دوال Toast */
function showSuccessToast(message) {
  const toastBody = document.getElementById("successToastBody");
  if (toastBody) { toastBody.textContent = message; }
  const toastEl = document.getElementById("successToast");
  if (toastEl) { new bootstrap.Toast(toastEl).show(); }
}

function showErrorToast(message) {
  const toastBody = document.getElementById("errorToastBody");
  if (toastBody) { toastBody.textContent = message; }
  const toastEl = document.getElementById("errorToast");
  if (toastEl) { new bootstrap.Toast(toastEl).show(); }
}

/* البحث عن حاج */
function searchPilgrim() {
  const passport = document.getElementById("passport").value;
  if (!passport.trim()) {
    document.getElementById("searchMessage").textContent = "يرجى إدخال رقم الجواز للبحث.";
    return;
  }
  const searchUrl = `${API_URL}?action=searchPilgrim&passport=${encodeURIComponent(passport)}`;
  console.log("Search URL:", searchUrl);
  fetch(searchUrl, { method: "GET" })
    .then(response => response.json())
    .then(data => {
      const pilgrimCard = document.getElementById("pilgrimCard");
      const pilgrimInfo = document.getElementById("pilgrimInfo");
      if (data.length > 0) {
        pilgrimCard.classList.remove("d-none");
        const p = data[0];
        pilgrimInfo.innerHTML = `
          <table class="table table-bordered mb-0 text-center fade-in" style="font-size: 1.1rem;">
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
        document.getElementById("hiddenPassport").value = p["رقم الجواز"];
        checkReportStatus(p["رقم الجواز"]);
        document.getElementById("searchMessage").textContent = "";
      } else {
        document.getElementById("searchMessage").textContent = "لم يتم العثور على الحاج بهذا الرقم.";
        document.getElementById("pilgrimCard").classList.add("d-none");
      }
    })
    .catch(error => {
      console.error("خطأ أثناء البحث:", error);
      showErrorToast("حدث خطأ أثناء البحث.");
    });
}

/* التحقق من وجود تقرير */
function checkReportStatus(passport) {
  const reportUrl = `${API_URL}?action=getReport&passport=${encodeURIComponent(passport)}`;
  fetch(reportUrl, { method: "GET" })
    .then(response => response.json())
    .then(data => {
      const reportBtn = document.getElementById("viewReportBtn");
      if (data && data.length > 0) {
        reportBtn.innerHTML = `تقرير <span class="badge bg-success" style="font-size:0.8rem; margin-right:5px;">✔</span>`;
      } else {
        reportBtn.innerHTML = "تقرير";
      }
    })
    .catch(error => {
      console.error("خطأ أثناء التحقق من التقرير:", error);
    });
}

/* فتح نافذة إضافة بيانات علاجية */
function openModal() {
  new bootstrap.Modal(document.getElementById('addDataModal')).show();
}

/* حفظ البيانات العلاجية */
function saveTreatmentData() {
  const passport = document.getElementById("hiddenPassport").value;
  const doctorName = document.getElementById("doctorName").value;
  const hotel = document.getElementById("hotel").value;
  const treatmentDate = document.getElementById("treatmentDate").value;
  const treatmentTime = document.getElementById("treatmentTime").value;
  const conservatory = document.getElementById("conservatory").value;
  const maritalStatus = document.getElementById("maritalStatus").value;
  const diseaseType = document.getElementById("diseaseType").value;
  const diagnosis = document.getElementById("diagnosis").value;
  const prescription = document.getElementById("prescription").value;
  const treatmentDispensing = document.getElementById("treatmentDispensing").value;
  const additionalNotes = document.getElementById("additionalNotes").value;

  if (!passport || !doctorName || !hotel || !treatmentDate || !treatmentTime ||
      !conservatory || !maritalStatus || !diseaseType || !diagnosis || !prescription || !treatmentDispensing) {
    showErrorToast("يرجى ملء جميع الحقول المطلوبة.");
    return;
  }

  const searchUrl = `${API_URL}?action=searchPilgrim&passport=${encodeURIComponent(passport)}`;
  fetch(searchUrl, { method: "GET" })
    .then(response => response.json())
    .then(result => {
      if (result.length > 0) {
        const formData = new URLSearchParams();
        formData.append("action", "updatePilgrim");
        formData.append("passport", passport);
        formData.append("doctorName", doctorName);
        formData.append("hotel", hotel);
        formData.append("treatmentDate", treatmentDate);
        formData.append("treatmentTime", treatmentTime);
        formData.append("conservatory", conservatory);
        formData.append("maritalStatus", maritalStatus);
        formData.append("diseaseType", diseaseType);
        formData.append("diagnosis", diagnosis);
        formData.append("prescription", prescription);
        formData.append("treatmentDispensing", treatmentDispensing);
        formData.append("additionalNotes", additionalNotes);

        const updateUrl = `${API_URL}?${formData.toString()}`;
        fetch(updateUrl, { method: "GET" })
          .then(response => response.json())
          .then(data => {
            showSuccessToast(data.message);
            new bootstrap.Modal(document.getElementById('addDataModal')).hide();
            checkReportStatus(passport);
            localStorage.removeItem("treatmentFormData");
          })
          .catch(error => {
            console.error("Update error:", error);
            showErrorToast("حدث خطأ أثناء تحديث البيانات.");
          });
      } else {
        showErrorToast("لم يتم العثور على بيانات الحاج!");
      }
    })
    .catch(error => {
      console.error("Search error:", error);
      showErrorToast("حدث خطأ أثناء البحث لتحديث البيانات.");
    });
}

/* عرض تقرير الحاج */
function viewReport() {
  const passport = document.getElementById("hiddenPassport").value.trim();
  const reportUrl = `${API_URL}?action=getReport&passport=${encodeURIComponent(passport)}`;
  fetch(reportUrl, { method: "GET" })
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        let reportContent = `
          <!DOCTYPE html>
          <html lang="ar" dir="rtl">
          <head>
            <meta charset="UTF-8">
            <title>تقرير الحاج</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'Cairo', sans-serif; margin:0; padding:20px; background-color:#f9f9f9; text-align:right; }
              h1 { text-align:center; margin-bottom:20px; color:#333; }
              .report-container { background:#fff; border-radius:8px; border:1px solid #ccc; padding:20px; max-width:600px; margin:0 auto; box-shadow:0 3px 10px rgba(0,0,0,0.15); }
              table { width:100%; border-collapse:collapse; }
              th, td { padding:10px; border-bottom:1px solid #ddd; vertical-align:top; }
              th { background-color:#f2f2f2; width:40%; color:#333; text-align:right; }
              td { color:#555; text-align:right; }
              .export-btn { margin: 10px 5px; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; }
              .export-pdf { background-color: #d9534f; color: #fff; }
              .export-excel { background-color: #5cb85c; color: #fff; }
            </style>
          </head>
          <body>
            <div class="report-container">
              <h1>تقرير الحاج</h1>
              <div style="text-align:center; margin-bottom:15px;">
                <button class="export-btn export-pdf" onclick="window.print()">تصدير PDF</button>
                <button class="export-btn export-excel" onclick="exportReportExcel()">تصدير Excel</button>
              </div>
              <table id="reportTable">
                <tbody>
                  <tr><th>المنشأة</th><td>${data[0]["المنشأة"]}</td></tr>
                  <tr><th>الفندق</th><td>${data[0]["الفندق"]}</td></tr>
                  <tr><th>اسم الحاج</th><td>${data[0]["اسم الحاج"]}</td></tr>
                  <tr><th>رقم الجواز</th><td>${data[0]["رقم الجواز"]}</td></tr>
                  <tr><th>الجنس</th><td>${data[0]["الجنس"]}</td></tr>
                  <tr><th>العمر</th><td>${data[0]["العمر"]}</td></tr>
                  <tr><th>المرض المزمن</th><td>${data[0]["المرض المزمن"]}</td></tr>
                  <tr><th>اسم الطبيب</th><td>${data[0]["اسم الطبيب"] || data[0]["doctorName"]}</td></tr>
                  <tr><th>تاريخ العلاج</th><td>${data[0]["تاريخ العلاج"] || data[0]["treatmentDate"]}</td></tr>
                  <tr><th>الوقت</th><td>${data[0]["الوقت"] || data[0]["treatmentTime"]}</td></tr>
                  <tr><th>المحافظة</th><td>${data[0]["المحافظة"] || data[0]["conservatory"]}</td></tr>
                  <tr><th>الحالة الاجتماعية</th><td>${data[0]["الحالة الاجتماعية"] || data[0]["maritalStatus"]}</td></tr>
                  <tr><th>الحالة المرضية</th><td>${data[0]["الحالة المرضية"] || data[0]["diseaseType"]}</td></tr>
                  <tr><th>التشخيص</th><td>${data[0]["التشخيص"]}</td></tr>
                  <tr><th>الوصفة الطبية</th><td>${data[0]["الوصفة الطبية"]}</td></tr>
                  <tr><th>صرف العلاج</th><td>${data[0]["صرف العلاج"] || data[0]["treatmentDispensing"]}</td></tr>
                  <tr><th>ملاحظات إضافية</th><td>${data[0]["ملاحظات إضافية"] || data[0]["additionalNotes"]}</td></tr>
                  <tr><th>تقييم الحالة</th><td>${data[0]["تقييم الحالة"]}</td></tr>
                </tbody>
              </table>
            </div>
            <script>
              function exportReportExcel() {
                var table = document.getElementById("reportTable").outerHTML;
                var dataType = 'application/vnd.ms-excel';
                var filename = 'report.xls';
                var downloadLink = document.createElement("a");
                downloadLink.href = 'data:' + dataType + ', ' + encodeURIComponent(table);
                downloadLink.download = filename;
                downloadLink.click();
              }
            </script>
          </body>
          </html>
        `;
        const reportWindow = window.open("", "تقرير الحاج", "width=700,height=800");
        reportWindow.document.write(reportContent);
        reportWindow.document.close();
      } else {
        showErrorToast("لا يوجد تقرير لهذا الحاج أو لم يتم تشخيصه سابقاً.");
      }
    })
    .catch(error => {
      console.error("خطأ أثناء جلب التقرير:", error);
      showErrorToast("حدث خطأ أثناء جلب التقرير.");
    });
}

/* عرض نافذة التفاصيل */
function viewDetails() {
  const passport = document.getElementById("hiddenPassport").value.trim();
  const detailsUrl = `${API_URL}?action=getPilgrimDetails&passport=${encodeURIComponent(passport)}`;
  fetch(detailsUrl, { method: "GET" })
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        const p = data[0];
        document.getElementById("detailInstitution").value = p["المنشأة"];
        document.getElementById("detailHotel").value = p["الفندق"];
        document.getElementById("detailName").value = p["اسم الحاج"];
        document.getElementById("detailPassport").value = p["رقم الجواز"];
        document.getElementById("detailGender").value = p["الجنس"];
        document.getElementById("detailAge").value = p["العمر"];
        document.getElementById("detailHealth").value = p["المرض المزمن"];
        document.getElementById("detailTreatmentName").value = p["اسم الطبيب"] || p["doctorName"];
        document.getElementById("detailDiagnosis").value = p["التشخيص"];
        document.getElementById("detailPrescription").value = p["الوصفة الطبية"];
        document.getElementById("detailNotes").value = p["الملاحظات"];
        document.getElementById("detailTreatmentDate").value = p["تاريخ العلاج"] || p["treatmentDate"];
        document.getElementById("detailTreatmentTime").value = p["الوقت"] || p["treatmentTime"];
        document.getElementById("detailConservatory").value = p["المحافظة"] || p["conservatory"];
        document.getElementById("detailMaritalStatus").value = p["الحالة الاجتماعية"] || p["maritalStatus"];
        document.getElementById("detailDiseaseType").value = p["الحالة المرضية"] || p["diseaseType"];
        document.getElementById("detailTreatmentDispensing").value = p["صرف العلاج"] || p["treatmentDispensing"];
        new bootstrap.Modal(document.getElementById('detailModal')).show();
      } else {
        showErrorToast("لم يتم العثور على تفاصيل الحاج.");
      }
    })
    .catch(error => {
      console.error("خطأ في جلب التفاصيل:", error);
      showErrorToast("حدث خطأ أثناء جلب التفاصيل.");
    });
}

/* حفظ التعديلات */
function editDetails() {
  const institution = document.getElementById("detailInstitution").value;
  const hotel = document.getElementById("detailHotel").value;
  const name = document.getElementById("detailName").value;
  const passport = document.getElementById("detailPassport").value;
  const gender = document.getElementById("detailGender").value;
  const age = document.getElementById("detailAge").value;
  const health = document.getElementById("detailHealth").value;
  const treatmentName = document.getElementById("detailTreatmentName").value;
  const diagnosis = document.getElementById("detailDiagnosis").value;
  const prescription = document.getElementById("detailPrescription").value;
  const notes = document.getElementById("detailNotes").value;
  const treatmentDate = document.getElementById("detailTreatmentDate").value;
  const treatmentTime = document.getElementById("detailTreatmentTime").value;
  const conservatory = document.getElementById("detailConservatory").value;
  const maritalStatus = document.getElementById("detailMaritalStatus").value;
  const diseaseType = document.getElementById("detailDiseaseType").value;
  const treatmentDispensing = document.getElementById("detailTreatmentDispensing").value;
  
  const formData = new URLSearchParams();
  formData.append("action", "editPilgrim");
  formData.append("institution", institution);
  formData.append("hotel", hotel);
  formData.append("name", name);
  formData.append("passport", passport);
  formData.append("gender", gender);
  formData.append("age", age);
  formData.append("health", health);
  formData.append("treatmentName", treatmentName);
  formData.append("diagnosis", diagnosis);
  formData.append("prescription", prescription);
  formData.append("treatmentNotes", notes);
  formData.append("treatmentDate", treatmentDate);
  formData.append("treatmentTime", treatmentTime);
  formData.append("conservatory", conservatory);
  formData.append("maritalStatus", maritalStatus);
  formData.append("diseaseType", diseaseType);
  formData.append("treatmentDispensing", treatmentDispensing);
  
  const updateUrl = `${API_URL}?${formData.toString()}`;
  fetch(updateUrl, { method: "GET" })
    .then(response => response.json())
    .then(data => {
      showSuccessToast(data.message);
      new bootstrap.Modal(document.getElementById('detailModal')).hide();
      searchPilgrim();
    })
    .catch(error => {
      console.error("خطأ أثناء تحديث التفاصيل:", error);
      showErrorToast("حدث خطأ أثناء تحديث التفاصيل.");
    });
}

/* حذف سجل الحاج */
function deleteDetails() {
  if (!confirm("هل أنت متأكد من حذف بيانات الحاج؟")) return;
  const passport = document.getElementById("detailPassport").value;
  const deleteUrl = `${API_URL}?action=deletePilgrim&passport=${encodeURIComponent(passport)}`;
  fetch(deleteUrl, { method: "GET" })
    .then(response => response.json())
    .then(data => {
      showSuccessToast(data.message);
      new bootstrap.Modal(document.getElementById('detailModal')).hide();
      document.getElementById("pilgrimCard").classList.add("d-none");
    })
    .catch(error => {
      console.error("خطأ أثناء حذف السجل:", error);
      showErrorToast("حدث خطأ أثناء حذف السجل.");
    });
}

/* عرض التقرير اليومي والإحصائي */
function showDailyReport() {
  fetch(`${API_URL}?action=dailyReport`, { method: "GET" })
    .then(response => response.json())
    .then(data => console.log("بيانات التقرير اليومي:", data))
    .catch(error => console.error("خطأ:", error));
}

/* لوحة تحكم إحصائية */
function loadAnalytics() {
  fetch(`${API_URL}?action=analyticsReport`, { method: "GET" })
    .then(response => response.json())
    .then(data => {
      console.log("التحليلات:", data);
    })
    .catch(error => console.error("خطأ في التحليلات:", error));
}
