// رابط النشر المحدث
const API_URL = "https://script.google.com/macros/s/AKfycbxNH6FL0rgubu7q9gGCHpGVnkZ7-BDC1ttKtTuBpzK3Kyr6SCLxw3wYPGfSeHjhWtu5/exec";

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
          <table class="table table-bordered mb-0 text-center" style="font-size: 1.1rem;">
            <tbody>
              <tr><th>المنشأة</th><td>${p["المنشأة"]}</td></tr>
              <tr><th>الفندق</th><td>${p["الفندق"]}</td></tr>
              <tr><th>اسم الحاج</th><td>${p["اسم الحاج"]}</td></tr>
              <tr><th>رقم الجواز</th><td>${p["رقم الجواز"]}</td></tr>
              <tr><th>الجنس</th><td>${p["الجنس"]}</td></tr>
              <tr><th>العمر</th><td>${p["العمر"]}</td></tr>
              <tr><th>الحالة المرضية</th><td>${p["الحالة المرضية"]}</td></tr>
              <tr><th>اسم العلاج المستخدم</th><td>${p["اسم العلاج المستخدم"]}</td></tr>
            </tbody>
          </table>
        `;
        // تخزين رقم الجواز في حقل مخفي لاستخدامه لاحقاً
        document.getElementById("hiddenPassport").value = p["رقم الجواز"];
        checkReportStatus(p["رقم الجواز"]);
      } else {
        pilgrimCard.classList.add("d-none");
        showErrorToast("لم يتم العثور على الحاج بهذا الرقم.");
      }
    })
    .catch(error => {
      console.error("خطأ أثناء البحث:", error);
      showErrorToast("حدث خطأ أثناء البحث.");
    });
}

/* التحقق من وجود تقرير (لتحديث زر التقرير) */
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
  const diagnosis = document.getElementById("diagnosis").value;
  const prescription = document.getElementById("prescription").value;
  const treatmentNotes = document.getElementById("treatmentNotes").value;
  const searchUrl = `${API_URL}?action=searchPilgrim&passport=${encodeURIComponent(passport)}`;
  fetch(searchUrl, { method: "GET" })
    .then(response => response.json())
    .then(result => {
      if (result.length > 0) {
        const formData = new URLSearchParams();
        formData.append("action", "updatePilgrim");
        formData.append("passport", passport);
        formData.append("diagnosis", diagnosis);
        formData.append("prescription", prescription);
        formData.append("treatmentNotes", treatmentNotes);
        const updateUrl = `${API_URL}?${formData.toString()}`;
        fetch(updateUrl, { method: "GET" })
          .then(response => response.json())
          .then(data => {
            showSuccessToast(data.message);
            new bootstrap.Modal(document.getElementById('addDataModal')).hide();
            checkReportStatus(passport);
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

/* عرض تقرير الحاج بنمط احترافي */
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
            </style>
          </head>
          <body>
            <div class="report-container">
              <h1>تقرير الحاج</h1>
              <table>
                <tbody>
                  <tr><th>المنشأة</th><td>${data[0]["المنشأة"]}</td></tr>
                  <tr><th>الفندق</th><td>${data[0]["الفندق"]}</td></tr>
                  <tr><th>اسم الحاج</th><td>${data[0]["اسم الحاج"]}</td></tr>
                  <tr><th>رقم الجواز</th><td>${data[0]["رقم الجواز"]}</td></tr>
                  <tr><th>الجنس</th><td>${data[0]["الجنس"]}</td></tr>
                  <tr><th>العمر</th><td>${data[0]["العمر"]}</td></tr>
                  <tr><th>الحالة المرضية</th><td>${data[0]["الحالة المرضية"]}</td></tr>
                  <tr><th>اسم العلاج المستخدم</th><td>${data[0]["اسم العلاج المستخدم"]}</td></tr>
                  <tr><th>التشخيص</th><td>${data[0]["التشخيص"]}</td></tr>
                  <tr><th>الوصفة الطبية</th><td>${data[0]["الوصفة الطبية"]}</td></tr>
                  <tr><th>الملاحظات</th><td>${data[0]["الملاحظات"]}</td></tr>
                </tbody>
              </table>
            </div>
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

/* عرض نافذة التفاصيل التفصيلية مع خيارات تحرير وحذف */
function viewDetails() {
  const passport = document.getElementById("hiddenPassport").value.trim();
  const detailsUrl = `${API_URL}?action=getPilgrimDetails&passport=${encodeURIComponent(passport)}`;
  fetch(detailsUrl, { method: "GET" })
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        const p = data[0];
        // تعبئة نافذة التفاصيل
        document.getElementById("detailInstitution").value = p["المنشأة"];
        document.getElementById("detailHotel").value = p["الفندق"];
        document.getElementById("detailName").value = p["اسم الحاج"];
        document.getElementById("detailPassport").value = p["رقم الجواز"];
        document.getElementById("detailGender").value = p["الجنس"];
        document.getElementById("detailAge").value = p["العمر"];
        document.getElementById("detailHealth").value = p["الحالة المرضية"];
        document.getElementById("detailTreatmentName").value = p["اسم العلاج المستخدم"];
        document.getElementById("detailDiagnosis").value = p["التشخيص"];
        document.getElementById("detailPrescription").value = p["الوصفة الطبية"];
        document.getElementById("detailNotes").value = p["الملاحظات"];
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

/* حفظ التعديلات (تحرير) من نافذة التفاصيل */
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
  const updateUrl = `${API_URL}?${formData.toString()}`;
  fetch(updateUrl, { method: "GET" })
    .then(response => response.json())
    .then(data => {
      showSuccessToast(data.message);
      new bootstrap.Modal(document.getElementById('detailModal')).hide();
      searchPilgrim(); // تحديث العرض
    })
    .catch(error => {
      console.error("خطأ أثناء تحديث التفاصيل:", error);
      showErrorToast("حدث خطأ أثناء تحديث التفاصيل.");
    });
}

/* حذف سجل الحاج (مع تأكيد) */
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

/* دالة عرض التقرير اليومي والإحصائي (اختياري) */
function showDailyReport() {
  fetch(`${API_URL}?action=dailyReport`, { method: "GET" })
    .then(response => response.json())
    .then(data => console.log("بيانات التقرير اليومي:", data))
    .catch(error => console.error("خطأ:", error));
}

/* دالة لوحة تحكم إحصائية */
function loadAnalytics() {
  fetch(`${API_URL}?action=analyticsReport`, { method: "GET" })
    .then(response => response.json())
    .then(data => {
      // هنا يمكنك تحديث عناصر الواجهة بناءً على البيانات الإحصائية
      console.log("التحليلات:", data);
    })
    .catch(error => console.error("خطأ في التحليلات:", error));
}
