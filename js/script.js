"use strict";

// تحديث رابط النشر إلى الرابط الجديد
const API_URL = "https://script.google.com/macros/s/AKfycbxWiJik7tzl-A1HTwDu_wTz4PcyO0nB0fblzOMMBDFSu5MmVtd_lUBgL0c1yT2tzMeO/exec";

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

// دوال تنسيق التاريخ والوقت
function formatDate(isoString) {
  if (!isoString) return "";
  var d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString("ar-EG");
}

function formatTime(isoString) {
  if (!isoString) return "";
  var d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' });
}

// ================================
// البحث عن حاج (يمكن البحث برقم الجواز أو باسم الحاج)
// ================================
function searchPilgrim() {
  var passport = document.getElementById("hiddenPassport").value.trim();
  var pilgrimName = document.getElementById("pilgrimName") ? document.getElementById("pilgrimName").value.trim() : "";
  
  if (!passport && !pilgrimName) {
    var msgEl = document.getElementById("searchMessage");
    if (msgEl) msgEl.textContent = "يرجى إدخال رقم الجواز أو اسم الحاج للبحث.";
    return;
  }
  
  var searchUrl = "";
  // إذا تم إدخال رقم الجواز نعطيه الأولوية
  if (passport) {
    searchUrl = `${API_URL}?action=searchPilgrim&passport=${encodeURIComponent(passport)}`;
  } else {
    // إذا كان رقم الجواز فارغًا، نبحث بالاسم باستخدام إجراء searchByName
    searchUrl = `${API_URL}?action=searchByName&pilgrimName=${encodeURIComponent(pilgrimName)}`;
  }
  
  fetch(searchUrl)
    .then(response => response.json())
    .then(data => {
      var pilgrimCard = document.getElementById("pilgrimCard");
      var pilgrimInfo = document.getElementById("pilgrimInfo");
      if (data.length > 0) {
        if (pilgrimCard) pilgrimCard.classList.remove("d-none");
       if (pilgrimInfo) {
  var p = data[0];
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
  var hiddenPassport = document.getElementById("hiddenPassport");
  if (hiddenPassport && p["رقم الجواز"]) {
    hiddenPassport.value = p["رقم الجواز"];
    console.log("تم تحديث hiddenPassport: ", hiddenPassport.value);
  }
}

      } else {
        var msgEl = document.getElementById("searchMessage");
        if (msgEl) msgEl.textContent = "لم يتم العثور على نتائج مطابقة.";
        if (pilgrimCard) pilgrimCard.classList.add("d-none");
      }
    })
    .catch(error => {
      console.error("خطأ أثناء البحث:", error);
      showErrorToast("حدث خطأ أثناء البحث.");
    });
}

// ================================
// فتح نافذة إضافة بيانات علاجية وضبط التاريخ والوقت تلقائيًا
// ================================
function openModal() {
  var modalEl = document.getElementById("addDataModal");
  if (modalEl) {
    var now = new Date();
    var dateInput = document.getElementById("treatmentDate");
    var timeInput = document.getElementById("treatmentTime");
    if (dateInput) {
      dateInput.value = now.toISOString().slice(0, 10);
    }
    if (timeInput) {
      var hours = String(now.getHours()).padStart(2, '0');
      var minutes = String(now.getMinutes()).padStart(2, '0');
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
  var externalTransfer = document.getElementById("externalTransfer");
  var hospitalFields = document.getElementById("hospitalFields");
  if (!externalTransfer || !hospitalFields) return;
  if (externalTransfer.value === "نعم") {
    hospitalFields.style.display = "block";
    var now = new Date();
    document.getElementById("externalTransferDate").value = now.toISOString().slice(0, 10);
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
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
// حفظ بيانات العلاج
// ================================
function saveTreatmentData() {
  var hiddenPassportEl = document.getElementById("hiddenPassport");
  if (!hiddenPassportEl) return;
  var passport = hiddenPassportEl.value;  // نستخدم الحقل المخفي
  var doctorName = (document.getElementById("doctorName") || {}).value || "";
  var treatmentHotel = (document.getElementById("treatmentHotel") || {}).value || "";
  var treatmentDate = (document.getElementById("treatmentDate") || {}).value || "";
  var treatmentTime = (document.getElementById("treatmentTime") || {}).value || "";
  var conservatory = (document.getElementById("conservatory") || {}).value || "";
  var maritalStatus = (document.getElementById("maritalStatus") || {}).value || "";
  var diseaseType = (document.getElementById("diseaseType") || {}).value || "";
  var diagnosis = (document.getElementById("diagnosis") || {}).value || "";
  var prescription = (document.getElementById("prescription") || {}).value || "";
  var treatmentDispensing = (document.getElementById("treatmentDispensing") || {}).value || "";
  var externalTransfer = (document.getElementById("externalTransfer") || {}).value || "";
  var hospitalName = (document.getElementById("hospitalName") || {}).value || "";
  var externalTransferDate = (document.getElementById("externalTransferDate") || {}).value || "";
  var externalTransferTime = (document.getElementById("externalTransferTime") || {}).value || "";
  var diseaseStatus = (document.getElementById("diseaseStatus") || {}).value || "";
  var additionalNotes = (document.getElementById("additionalNotes") || {}).value || "";
  
  if (!passport || !doctorName || !treatmentHotel || !treatmentDate || !treatmentTime ||
      !conservatory || !maritalStatus || !diseaseType || !diagnosis || !prescription || !treatmentDispensing) {
    showErrorToast("يرجى ملء جميع الحقول المطلوبة.");
    return;
  }
  
  var searchUrl = `${API_URL}?action=searchPilgrim&passport=${encodeURIComponent(passport)}`;
  fetch(searchUrl)
    .then(response => response.json())
    .then(result => {
      if (result.length > 0) {
        var formData = new URLSearchParams();
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
        formData.append("diseaseStatus", diseaseStatus);
        formData.append("additionalNotes", additionalNotes);
        
        var updateUrl = `${API_URL}?${formData.toString()}`;
        fetch(updateUrl)
          .then(response => response.json())
          .then(data => {
            showSuccessToast(data.message || "تم حفظ بيانات العلاج بنجاح.");
            var modalEl = document.getElementById("addDataModal");
            if (modalEl) new bootstrap.Modal(modalEl).hide();
          })
          .catch(error => {
            console.error("خطأ أثناء تحديث بيانات العلاج:", error);
            showErrorToast("حدث خطأ أثناء تحديث بيانات العلاج.");
          });
      } else {
        showErrorToast("لم يتم العثور على الحاج!");
      }
    })
    .catch(error => {
      console.error("خطأ أثناء البحث لتحديث بيانات العلاج:", error);
      showErrorToast("حدث خطأ أثناء البحث لتحديث بيانات العلاج.");
    });
}

// ================================
// فتح نافذة بيانات الوفاة
// ================================
function openDeathModal() {
  var modalEl = document.getElementById("deathDataModal");
  if (modalEl) {
    var now = new Date();
    var deathDateInput = document.getElementById("deathDate");
    var deathTimeInput = document.getElementById("deathTime");
    if (deathDateInput) {
      deathDateInput.value = now.toISOString().slice(0, 10);
    }
    if (deathTimeInput) {
      var hours = String(now.getHours()).padStart(2, '0');
      var minutes = String(now.getMinutes()).padStart(2, '0');
      deathTimeInput.value = `${hours}:${minutes}`;
    }
    new bootstrap.Modal(modalEl).show();
  }
}

// ================================
// حفظ بيانات الوفاة
// ================================
function saveDeathData() {
  var passport = (document.getElementById("hiddenPassport") || {}).value.trim();
  var deathCause = (document.getElementById("deathCause") || {}).value || "";
  var deathHospital = (document.getElementById("deathHospital") || {}).value || "";
  var burialPlace = (document.getElementById("burialPlace") || {}).value || "";
  var deathDate = (document.getElementById("deathDate") || {}).value || "";
  var deathTime = (document.getElementById("deathTime") || {}).value || "";
  var deathNotes = (document.getElementById("deathNotes") || {}).value || "";
  
  if (!passport || !deathCause || !deathHospital) {
    showErrorToast("يرجى ملء كافة بيانات الوفاة المطلوبة (رقم الجواز، سبب الوفاة، المستشفى).");
    return;
  }
  
  var formData = new URLSearchParams();
  formData.append("action", "updateDeathData");
  formData.append("passport", passport);
  formData.append("deathCause", deathCause);
  formData.append("deathHospital", deathHospital);
  formData.append("burialPlace", burialPlace);
  formData.append("deathDate", deathDate);
  formData.append("deathTime", deathTime);
  formData.append("deathNotes", deathNotes);
  
  fetch(`${API_URL}?${formData.toString()}`)
    .then(response => response.json())
    .then(data => {
      showSuccessToast(data.message || "تم تحديث بيانات الوفاة بنجاح.");
      var modalEl = document.getElementById("deathDataModal");
      if (modalEl) new bootstrap.Modal(modalEl).hide();
    })
    .catch(error => {
      console.error("خطأ أثناء تحديث بيانات الوفاة:", error);
      showErrorToast("حدث خطأ أثناء تحديث بيانات الوفاة.");
    });
}

// ================================
// دوال تصدير Excel باستخدام ExcelJS
// ================================
function exportToExcel(data, columns, fileName = "Report.xlsx") {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'YourApp';
  workbook.created = new Date();
  workbook.modified = new Date();
  
  // إنشاء ورقة عمل جديدة مع تعيين اتجاهها من اليمين إلى اليسار
  const worksheet = workbook.addWorksheet('Report', { properties: { rightToLeft: true } });
  worksheet.views = [{ rightToLeft: true }];
  
  // إنشاء نسخة معكوسة من الأعمدة وتعيين محاذاة اليمين لكل عمود
  const reversedColumns = columns.slice().reverse().map(col => ({
    header: col.header,
    key: col.key,
    width: col.width,
    style: { alignment: { horizontal: 'right' } }
  }));
  worksheet.columns = reversedColumns;
  
  // إضافة الصفوف وفق ترتيب الأعمدة المقلوب وتعيين محاذاة الخلايا
  data.forEach(row => {
    const rowArray = reversedColumns.map(col => row[col.key]);
    const newRow = worksheet.addRow(rowArray);
    newRow.eachCell({ includeEmpty: true }, function(cell) {
      cell.alignment = { horizontal: 'right' };
    });
  });
  
  workbook.xlsx.writeBuffer().then(function(buffer) {
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

// دالة تصدير Excel عامة تعتمد على استخراج البيانات من جدول HTML
function exportReportExcel(elementId, tableSelector) {
  var table = document.querySelector(tableSelector);
  if (!table) {
    showErrorToast("لا توجد بيانات لتصديرها.");
    return;
  }
  // استخراج رؤوس الأعمدة
  var headers = [];
  var headerCells = table.querySelectorAll("thead tr th");
  headerCells.forEach(function(th) {
    headers.push(th.textContent.trim());
  });
  
  // استخراج البيانات من الصفوف
  var data = [];
  var rows = table.querySelectorAll("tbody tr");
  rows.forEach(function(tr) {
    var rowData = {};
    var cells = tr.querySelectorAll("td");
    cells.forEach(function(td, i) {
      rowData[headers[i]] = td.textContent.trim();
    });
    data.push(rowData);
  });
  
  // إعداد الأعمدة بناءً على رؤوس الأعمدة
  var columns = headers.map(function(header) {
    return { header: header, key: header, width: 20 };
  });
  
  exportToExcel(data, columns, "Report.xlsx");
}

// دالة خاصة لتصدير عدد الزوار اليومي
function exportDailyExcel() {
  exportReportExcel('dailyReportContent', '#dailyTable table');
}

// ================================
// تقارير النظام
// ================================

// تقرير الحالات المحولة
function fetchTransferredReport() {
  var requestUrl = `${API_URL}?action=getTransferredCases`;
  fetch(requestUrl)
    .then(response => response.json())
    .then(data => {
      data.sort((a, b) => new Date(a["تاريخ التحويل"]) - new Date(b["تاريخ التحويل"]));
      var reportDiv = document.getElementById("transferredReportContent");
      if (data.length > 0) {
        var html = "<div class='table-responsive' id='transferredTable'><table class='table table-bordered text-center rtl-table'><thead><tr>" +
                     "<th>المنشأة</th>" +
                     "<th>الفندق</th>" +
                     "<th>اسم الحاج</th>" +
                     "<th>رقم الجواز</th>" +
                     "<th>الجنس</th>" +
                     "<th>العمر</th>" +
                     "<th>المحافظة</th>" +
                     "<th>الحالة المرضية</th>" +
                     "<th>التشخيص</th>" +
                     "<th>اسم المستشفى</th>" +
                     "<th>تاريخ التحويل</th>" +
                     "<th>وقت التحويل</th>" +
                     "<th>حالة المريض</th>" +
                   "</tr></thead><tbody>";
        data.forEach(item => {
          html += "<tr>" +
                    `<td>${item["المنشأة"] || ""}</td>` +
                    `<td>${item["الفندق"] || ""}</td>` +
                    `<td>${item["اسم الحاج"] || ""}</td>` +
                    `<td>${item["رقم الجواز"] || ""}</td>` +
                    `<td>${item["الجنس"] || ""}</td>` +
                    `<td>${item["العمر"] || ""}</td>` +
                    `<td>${item["المحافظة"] || ""}</td>` +
                    `<td>${item["الحالة المرضية"] || ""}</td>` +
                    `<td>${item["التشخيص"] || ""}</td>` +
                    `<td>${item["اسم المستشفى"] || ""}</td>` +
                    `<td>${item["تاريخ التحويل"] ? formatDate(item["تاريخ التحويل"]) : ""}</td>` +
                    `<td>${item["وقت التحويل"] ? formatTime(item["وقت التحويل"]) : ""}</td>` +
                    `<td>${item["حالة المريض"] || ""}</td>` +
                  "</tr>";
        });
        html += "</tbody></table></div>";
        reportDiv.innerHTML = html;
        setTimeout(() => {
          $('#transferredTable table').DataTable({
            paging: true,
            searching: true,
            ordering: true,
            language: { url: "https://cdn.datatables.net/plug-ins/1.13.4/i18n/ar.json" }
          });
        }, 0);
      } else {
        reportDiv.innerHTML = "لا توجد بيانات حالات محولة متوفرة.";
      }
    })
    .catch(error => {
      console.error("خطأ أثناء جلب حالات التحويل:", error);
      var reportDiv = document.getElementById("transferredReportContent");
      reportDiv.innerHTML = "حدث خطأ أثناء جلب البيانات.";
    });
}

// تقرير عدد الزوار اليومي
function fetchDailyVisitors() {
  var requestUrl = `${API_URL}?action=getDailyVisitors`;
  fetch(requestUrl)
    .then(response => response.json())
    .then(data => {
      data.sort((a, b) => new Date(a["التاريخ"]) - new Date(b["التاريخ"]));
      var reportDiv = document.getElementById("dailyReportContent");
      if (data.length > 0) {
        var html = "<div class='table-responsive' id='dailyTable'><table class='table table-bordered text-center rtl-table'><thead><tr>" +
                     "<th>المنشأة</th>" +
                     "<th>اسم الطبيب</th>" +
                     "<th>الفندق العلاجي</th>" +
                     "<th>اسم الحاج</th>" +
                     "<th>رقم الجواز</th>" +
                     "<th>الجنس</th>" +
                     "<th>العمر</th>" +
                     "<th>المرض المزمن</th>" +
                     "<th>اسم العلاج المستخدم</th>" +
                     "<th>التاريخ</th>" +
                     "<th>الوقت</th>" +
                     "<th>المحافظة</th>" +
                     "<th>الحالة الاجتماعية</th>" +
                     "<th>الحالة المرضية</th>" +
                     "<th>التشخيص</th>" +
                     "<th>الوصفة الطبية</th>" +
                     "<th>صرف العلاج</th>" +
                   "</tr></thead><tbody>";
        data.forEach(item => {
          html += "<tr>" +
                    `<td>${item["المنشأة"] || ""}</td>` +
                    `<td>${item["اسم الطبيب"] || ""}</td>` +
                    `<td>${item["الفندق العلاجي"] || ""}</td>` +
                    `<td>${item["اسم الحاج"] || ""}</td>` +
                    `<td>${item["رقم الجواز"] || ""}</td>` +
                    `<td>${item["الجنس"] || ""}</td>` +
                    `<td>${item["العمر"] || ""}</td>` +
                    `<td>${item["المرض المزمن"] || ""}</td>` +
                    `<td>${item["اسم العلاج المستخدم"] || ""}</td>` +
                    `<td>${item["التاريخ"] ? formatDate(item["التاريخ"]) : ""}</td>` +
                    `<td>${item["الوقت"] ? formatTime(item["الوقت"]) : ""}</td>` +
                    `<td>${item["المحافظة"] || ""}</td>` +
                    `<td>${item["الحالة الاجتماعية"] || ""}</td>` +
                    `<td>${item["الحالة المرضية"] || ""}</td>` +
                    `<td>${item["التشخيص"] || ""}</td>` +
                    `<td>${item["الوصفة الطبية"] || ""}</td>` +
                    `<td>${item["صرف العلاج"] || ""}</td>` +
                  "</tr>";
        });
        html += "</tbody></table></div>";
        reportDiv.innerHTML = html;
        setTimeout(() => {
          $('#dailyTable table').DataTable({
            paging: true,
            searching: true,
            ordering: true,
            language: { url: "https://cdn.datatables.net/plug-ins/1.13.4/i18n/ar.json" }
          });
        }, 0);
      } else {
        reportDiv.innerHTML = "لا توجد بيانات متوفرة.";
      }
    })
    .catch(error => {
      console.error("خطأ أثناء جلب عدد الزوار اليومي:", error);
      var reportDiv = document.getElementById("dailyReportContent");
      reportDiv.innerHTML = "حدث خطأ أثناء جلب البيانات.";
    });
}

// تقرير الحاج (تقرير تفصيلي عند البحث برقم الجواز)
function fetchPatientReport() {
  var passport = document.getElementById("patientPassport").value.trim();
  if (!passport) {
    Swal.fire({
      icon: 'error',
      title: 'خطأ',
      text: 'يرجى إدخال رقم الجواز',
      confirmButtonText: 'حسناً'
    });
    return;
  }
  var reportUrl = `${API_URL}?action=getPatientReport&passport=${encodeURIComponent(passport)}`;
  fetch(reportUrl)
    .then(response => response.json())
    .then(data => {
      var reportDiv = document.getElementById("patientReportContent");
      if (data.length > 0) {
        var html = "<div class='table-responsive' id='patientTable'><table class='table table-bordered text-center rtl-table'><thead><tr>" +
                     "<th>المنشأة</th>" +
                     "<th>الفندق</th>" +
                     "<th>اسم الحاج</th>" +
                     "<th>رقم الجواز</th>" +
                     "<th>الجنس</th>" +
                     "<th>العمر</th>" +
                     "<th>المرض المزمن</th>" +
                     "<th>اسم العلاج المستخدم</th>" +
                   "</tr></thead><tbody>";
        data.forEach(item => {
          html += "<tr>" +
                    `<td>${item["المنشأة"] || ""}</td>` +
                    `<td>${item["الفندق"] || ""}</td>` +
                    `<td>${item["اسم الحاج"] || ""}</td>` +
                    `<td>${item["رقم الجواز"] || ""}</td>` +
                    `<td>${item["الجنس"] || ""}</td>` +
                    `<td>${item["العمر"] || ""}</td>` +
                    `<td>${item["المرض المزمن"] || ""}</td>` +
                    `<td>${item["اسم العلاج المستخدم"] || ""}</td>` +
                  "</tr>";
        });
        html += "</tbody></table></div>";
        reportDiv.innerHTML = html;
        setTimeout(() => {
          $('#patientTable table').DataTable({
            paging: true,
            searching: true,
            ordering: true,
            language: { url: "https://cdn.datatables.net/plug-ins/1.13.4/i18n/ar.json" }
          });
        }, 0);
      } else {
        reportDiv.innerHTML = "لا توجد بيانات متوفرة لهذا الحاج.";
      }
    })
    .catch(error => {
      console.error("خطأ أثناء جلب تقرير الحاج:", error);
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'حدث خطأ أثناء جلب التقرير.',
        confirmButtonText: 'حسناً'
      });
    });
}

// تقرير الوفيات
function fetchDeathReport() {
  var requestUrl = `${API_URL}?action=getDeathReport`;
  fetch(requestUrl)
    .then(response => response.json())
    .then(data => {
      data.sort((a, b) => new Date(a["تاريخ الوفاة"]) - new Date(b["تاريخ الوفاة"]));
      var reportDiv = document.getElementById("deathReportContent");
      if (data.length > 0) {
        var html = "<div class='table-responsive' id='deathTable'><table class='table table-bordered text-center rtl-table'><thead><tr>" +
                     "<th>المنشأة</th>" +
                     "<th>الفندق</th>" +
                     "<th>اسم الحاج</th>" +
                     "<th>رقم الجواز</th>" +
                     "<th>الجنس</th>" +
                     "<th>العمر</th>" +
                     "<th>المرض المزمن</th>" +
                     "<th>اسم العلاج المستخدم</th>" +
                     "<th>سبب الوفاة</th>" +
                     "<th>المستشفى</th>" +
                     "<th>مكان الدفن</th>" +
                     "<th>تاريخ الوفاة</th>" +
                     "<th>وقت الوفاة</th>" +
                     "<th>ملاحظات</th>" +
                   "</tr></thead><tbody>";
        data.forEach(item => {
          html += "<tr>" +
                    `<td>${item["المنشأة"] || ""}</td>` +
                    `<td>${item["الفندق"] || ""}</td>` +
                    `<td>${item["اسم الحاج"] || ""}</td>` +
                    `<td>${item["رقم الجواز"] || ""}</td>` +
                    `<td>${item["الجنس"] || ""}</td>` +
                    `<td>${item["العمر"] || ""}</td>` +
                    `<td>${item["المرض المزمن"] || ""}</td>` +
                    `<td>${item["اسم العلاج المستخدم"] || ""}</td>` +
                    `<td>${item["سبب الوفاة"] || ""}</td>` +
                    `<td>${item["المستشفى"] || ""}</td>` +
                    `<td>${item["مكان الدفن"] || ""}</td>` +
                    `<td>${item["تاريخ الوفاة"] ? formatDate(item["تاريخ الوفاة"]) : ""}</td>` +
                    `<td>${item["وقت الوفاة"] ? formatTime(item["وقت الوفاة"]) : ""}</td>` +
                    `<td>${item["ملاحظات"] || ""}</td>` +
                  "</tr>";
        });
        html += "</tbody></table></div>";
        reportDiv.innerHTML = html;
        setTimeout(() => {
          $('#deathTable table').DataTable({
            paging: true,
            searching: true,
            ordering: true,
            language: { url: "https://cdn.datatables.net/plug-ins/1.13.4/i18n/ar.json" }
          });
        }, 0);
      } else {
        reportDiv.innerHTML = "لا توجد بيانات وفيات متوفرة.";
      }
    })
    .catch(error => {
      console.error("خطأ أثناء جلب تقرير الوفيات:", error);
      var reportDiv = document.getElementById("deathReportContent");
      reportDiv.innerHTML = "حدث خطأ أثناء جلب البيانات.";
    });
}

// ================================
// دالة تصدير PDF
// ================================
function exportReportPDF(elementId, tableSelector) {
  var element = document.getElementById(elementId);
  if (!element) {
    showErrorToast("لا توجد بيانات لتصديرها إلى PDF.");
    return;
  }
  var dtInstance = null;
  if (tableSelector) {
    dtInstance = $(tableSelector).DataTable();
    dtInstance.destroy();
  }
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
    element.classList.add("table-responsive");
    element.style.overflow = "";
    element.style.width = "";
    if (tableSelector) {
      $(tableSelector).DataTable({
        paging: true,
        searching: true,
        autoWidth: true,
        responsive: true,
        language: { url: "https://cdn.datatables.net/plug-ins/1.13.4/i18n/ar.json" }
      });
    }
  });
}

// ================================
// استدعاء التقارير تلقائيًا عند تغيير التبويب
// ================================
document.addEventListener('DOMContentLoaded', () => {
  let transferredTab = document.getElementById('transferred-tab');
  transferredTab.addEventListener('shown.bs.tab', () => {
    fetchTransferredReport();
  });

  let dailyTab = document.getElementById('daily-tab');
  dailyTab.addEventListener('shown.bs.tab', () => {
    fetchDailyVisitors();
  });

  let deathTab = document.getElementById('death-tab');
  deathTab.addEventListener('shown.bs.tab', () => {
    fetchDeathReport();
  });
});

// كشف الدوال للاستخدام في الـ HTML
window.searchPilgrim = searchPilgrim;
window.openModal = openModal;
window.saveTreatmentData = saveTreatmentData;
window.handleExternalTransferChange = handleExternalTransferChange;
window.openDeathModal = openDeathModal;
window.saveDeathData = saveDeathData;
window.fetchPatientReport = fetchPatientReport;
window.exportReportPDF = exportReportPDF;
window.exportReportExcel = exportReportExcel;
window.exportDailyExcel = exportDailyExcel;
