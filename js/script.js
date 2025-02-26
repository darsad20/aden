"use strict";

// حدّث رابط الـAPI_URL إلى رابط مشروعك الفعلي
const API_URL = "https://script.google.com/macros/s/AKfycbxXxQLY1tmtvosdecPQnuTQ6517DZjHdH4-WD8lxZv3kOrcU2-a6yx3gXJ_dH0C4HoK/exec";

/*******************************************
 * دوال Toast (خطأ/نجاح)
 ******************************************/
function showErrorToast(msg) {
  Swal.fire({
    icon: "error",
    title: "خطأ",
    text: msg,
    confirmButtonText: "حسناً"
  });
}

function showSuccessToast(msg) {
  Swal.fire({
    icon: "success",
    title: "نجاح",
    text: msg,
    confirmButtonText: "حسناً"
  });
}

/*******************************************
 * تنسيق التاريخ والوقت
 ******************************************/
function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString("ar-EG");
}

function formatTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

/*******************************************
 * البحث عن حاج
 ******************************************/
function searchPilgrim() {
  const passportInput = document.getElementById("passport");
  const pilgrimNameInput = document.getElementById("pilgrimName");
  const msgEl = document.getElementById("searchMessage");
  const pilgrimCard = document.getElementById("pilgrimCard");
  const pilgrimInfo = document.getElementById("pilgrimInfo");
  const hiddenPassportEl = document.getElementById("hiddenPassport");

  if (!passportInput || !pilgrimNameInput) return;

  const passportVal = passportInput.value.trim();
  const pilgrimNameVal = pilgrimNameInput.value.trim();

  if (msgEl) msgEl.textContent = "";

  if (!passportVal && !pilgrimNameVal) {
    if (msgEl) msgEl.textContent = "يرجى إدخال رقم الجواز أو اسم الحاج للبحث.";
    if (pilgrimCard) pilgrimCard.classList.add("d-none");
    return;
  }

  let searchUrl = "";
  if (passportVal) {
    searchUrl = `${API_URL}?action=searchPilgrim&passport=${encodeURIComponent(passportVal)}`;
  } else {
    searchUrl = `${API_URL}?action=searchByName&pilgrimName=${encodeURIComponent(pilgrimNameVal)}`;
  }

  fetch(searchUrl)
    .then(res => res.json())
    .then(data => {
      if (data && data.length > 0) {
        if (pilgrimCard) pilgrimCard.classList.remove("d-none");
        if (pilgrimInfo) {
          const p = data[0];
pilgrimInfo.innerHTML = `
  <table class="table table-bordered table-striped mb-0 text-center fade-in">
    <tbody>
      <tr>
        <th>المنشأة <i class="fa-solid fa-hospital ms-1"></i></th>
        <td>${p["المنشأة"] || ""}</td>
      </tr>
      <tr>
        <th>الفندق <i class="fa-solid fa-hotel ms-1"></i></th>
        <td>${p["الفندق"] || ""}</td>
      </tr>
      <tr>
        <th>اسم الحاج <i class="fa-solid fa-user ms-1"></i></th>
        <td>${p["اسم الحاج"] || ""}</td>
      </tr>
      <tr>
        <th>رقم الجواز <i class="fa-solid fa-passport ms-1"></i></th>
        <td>${p["رقم الجواز"] || ""}</td>
      </tr>
      <tr>
        <th>الجنس <i class="fa-solid fa-venus-mars ms-1"></i></th>
        <td>${p["الجنس"] || ""}</td>
      </tr>
      <tr>
        <th>العمر <i class="fa-solid fa-birthday-cake ms-1"></i></th>
        <td>${p["العمر"] || ""}</td>
      </tr>
      <tr>
        <th>المرض المزمن <i class="fa-solid fa-virus ms-1"></i></th>
        <td>${p["المرض المزمن"] || ""}</td>
      </tr>
      <tr>
        <th>اسم العلاج المستخدم <i class="fa-solid fa-pills ms-1"></i></th>
        <td>${p["اسم العلاج المستخدم"] || ""}</td>
      </tr>
    </tbody>
  </table>
`;
          if (hiddenPassportEl && p["رقم الجواز"]) {
            hiddenPassportEl.value = p["رقم الجواز"];
          }
        }
      } else {
        if (msgEl) msgEl.textContent = "لم يتم العثور على نتائج مطابقة.";
        if (pilgrimCard) pilgrimCard.classList.add("d-none");
      }
    })
    .catch(error => {
      console.error("خطأ أثناء البحث:", error);
      showErrorToast("حدث خطأ أثناء البحث.");
    });
}

/*******************************************
 * فتح نافذة إضافة بيانات علاجية + ضبط التاريخ والوقت
 ******************************************/
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
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      timeInput.value = `${hours}:${minutes}`;
    }
    handleExternalTransferChange();
    new bootstrap.Modal(modalEl).show();
  }
}

/*******************************************
 * إظهار/إخفاء حقول التحويل الخارجي
 ******************************************/
function handleExternalTransferChange() {
  const externalTransfer = document.getElementById("externalTransfer");
  const hospitalFields = document.getElementById("hospitalFields");
  if (!externalTransfer || !hospitalFields) return;
  
  if (externalTransfer.value === "نعم") {
    hospitalFields.style.display = "block";
    // يمكنك أيضًا تعيين تاريخ ووقت افتراضي إذا أردت
    const now = new Date();
    document.getElementById("externalTransferDate").value = now.toISOString().slice(0, 10);
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    document.getElementById("externalTransferTime").value = `${hours}:${minutes}`;
  } else {
    hospitalFields.style.display = "none";
    // تفريغ الحقول إذا أردت
    document.getElementById("hospitalName").value = "";
    document.getElementById("externalTransferDate").value = "";
    document.getElementById("externalTransferTime").value = "";
    document.getElementById("diseaseStatus").value = "";
  }
}

// إضافة مستمع الحدث لتغيير القيمة
document.getElementById("externalTransfer").addEventListener("change", handleExternalTransferChange);


/*******************************************
 * حفظ بيانات العلاج
 ******************************************/
function saveTreatmentData() {
  const hiddenPassport = document.getElementById("hiddenPassport");
  if (!hiddenPassport) {
    showErrorToast("لا يوجد حقل جواز مخفي، يرجى البحث عن الحاج أولاً.");
    return;
  }

  const passport = hiddenPassport.value.trim();
  const doctorName = (document.getElementById("doctorName") || {}).value || "";
  const treatmentHotel = (document.getElementById("treatmentHotel") || {}).value || "";
  const treatmentDate = (document.getElementById("treatmentDate") || {}).value || "";
  const treatmentTime = (document.getElementById("treatmentTime") || {}).value || "";
  const conservatory = (document.getElementById("conservatory") || {}).value || "";
  const maritalStatus = (document.getElementById("maritalStatus") || {}).value || "";
  const diseaseType = (document.getElementById("diseaseType") || {}).value || "";
  const diagnosis = (document.getElementById("diagnosis") || {}).value || "";
  const prescription = (document.getElementById("prescription") || {}).value || "";
  const treatmentDispensing = (document.getElementById("treatmentDispensing") || {}).value || "";
  const externalTransfer = (document.getElementById("externalTransfer") || {}).value || "";
  const hospitalName = (document.getElementById("hospitalName") || {}).value || "";
  const externalTransferDate = (document.getElementById("externalTransferDate") || {}).value || "";
  const externalTransferTime = (document.getElementById("externalTransferTime") || {}).value || "";
  const diseaseStatus = (document.getElementById("diseaseStatus") || {}).value || "";
  const additionalNotes = (document.getElementById("additionalNotes") || {}).value || "";

  if (
    !passport ||
    !doctorName ||
    !treatmentHotel ||
    !treatmentDate ||
    !treatmentTime ||
    !conservatory ||
    !maritalStatus ||
    !diseaseType ||
    !diagnosis ||
    !prescription ||
    !treatmentDispensing
  ) {
    showErrorToast("يرجى ملء جميع الحقول المطلوبة.");
    return;
  }

  fetch(`${API_URL}?action=searchPilgrim&passport=${encodeURIComponent(passport)}`)
    .then(res => res.json())
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
        formData.append("diseaseStatus", diseaseStatus);
        formData.append("additionalNotes", additionalNotes);

        const updateUrl = `${API_URL}?${formData.toString()}`;
        fetch(updateUrl)
          .then(r => r.json())
          .then(data => {
            showSuccessToast(data.message || "تم حفظ بيانات العلاج بنجاح.");
            const modalEl = document.getElementById("addDataModal");
            if (modalEl) {
              new bootstrap.Modal(modalEl).hide();
            }
          })
          .catch(e => {
            console.error("خطأ أثناء تحديث بيانات العلاج:", e);
            showErrorToast("حدث خطأ أثناء تحديث بيانات العلاج.");
          });
      } else {
        showErrorToast("لم يتم العثور على الحاج!");
      }
    })
    .catch(e => {
      console.error("خطأ أثناء البحث لتحديث بيانات العلاج:", e);
      showErrorToast("حدث خطأ أثناء البحث لتحديث بيانات العلاج.");
    });
}

/*******************************************
 * فتح نافذة بيانات الوفاة
 ******************************************/
function openDeathModal() {
  const modalEl = document.getElementById("deathDataModal");
  if (modalEl) {
    const now = new Date();
    const deathDateInput = document.getElementById("deathDate");
    const deathTimeInput = document.getElementById("deathTime");
    if (deathDateInput) {
      deathDateInput.value = now.toISOString().slice(0, 10);
    }
    if (deathTimeInput) {
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      deathTimeInput.value = `${hours}:${minutes}`;
    }
    new bootstrap.Modal(modalEl).show();
  }
}

/*******************************************
 * حفظ بيانات الوفاة
 ******************************************/
function saveDeathData() {
  const passport = (document.getElementById("hiddenPassport") || {}).value.trim();
  const deathCause = (document.getElementById("deathCause") || {}).value || "";
  const deathHospital = (document.getElementById("deathHospital") || {}).value || "";
  const burialPlace = (document.getElementById("burialPlace") || {}).value || "";
  const deathDate = (document.getElementById("deathDate") || {}).value || "";
  const deathTime = (document.getElementById("deathTime") || {}).value || "";
  const deathNotes = (document.getElementById("deathNotes") || {}).value || "";

  if (!passport || !deathCause || !deathHospital) {
    showErrorToast("يرجى ملء كافة بيانات الوفاة المطلوبة (رقم الجواز، سبب الوفاة، المستشفى).");
    return;
  }

  const formData = new URLSearchParams();
  formData.append("action", "updateDeathData");
  formData.append("passport", passport);
  formData.append("deathCause", deathCause);
  formData.append("deathHospital", deathHospital);
  formData.append("burialPlace", burialPlace);
  formData.append("deathDate", deathDate);
  formData.append("deathTime", deathTime);
  formData.append("deathNotes", deathNotes);

  fetch(`${API_URL}?${formData.toString()}`)
    .then(r => r.json())
    .then(data => {
      showSuccessToast(data.message || "تم تحديث بيانات الوفاة بنجاح.");
      const modalEl = document.getElementById("deathDataModal");
      if (modalEl) {
        new bootstrap.Modal(modalEl).hide();
      }
    })
    .catch(e => {
      console.error("خطأ أثناء تحديث بيانات الوفاة:", e);
      showErrorToast("حدث خطأ أثناء تحديث بيانات الوفاة.");
    });
}

/*******************************************
 * دوال تصدير التقارير (PDF / Excel)
 ******************************************/
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
  element.classList.remove("table-responsive");
  element.style.overflow = "visible";
  element.style.width = "auto";

 html2pdf()
  .set({
    margin: 2, // تقليل الهامش لتوفير مساحة أكبر
    filename: "report.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { 
      scale: 3, 
      useCORS: true, 
      windowWidth: document.body.scrollWidth // يضمن عدم قص الأعمدة
    },
    jsPDF: { unit: "mm", format: "a2", orientation: "landscape" } // استخدام A2 لتوسيع الصفحة
  })
  .from(element)
  .save()
    .then(() => {
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
} // <--- إضافة هذا القوس كان ضرورياً لإغلاق الدالة بشكل صحيح

function exportReportExcel(elementId, tableSelector) {
  const table = document.querySelector(tableSelector);
  if (!table) {
    showErrorToast("لا توجد بيانات لتصديرها.");
    return;
  }

  // استخراج العناوين من الجدول
  const headers = [];
  const headerCells = table.querySelectorAll("thead tr th");
  headerCells.forEach(th => {
    headers.push(th.textContent.trim());
  });

  // استخراج بيانات الصفوف
  const data = [];
  const rows = table.querySelectorAll("tbody tr");
  rows.forEach(tr => {
    const rowData = {};
    const cells = tr.querySelectorAll("td");
    cells.forEach((td, i) => {
      rowData[headers[i]] = td.textContent.trim();
    });
    data.push(rowData);
  });

  // إعداد الأعمدة بناءً على العناوين
  const columns = headers.map(header => ({
    header: header,
    key: header,
    width: 20
  }));

  exportToExcel(data, columns, "Report.xlsx");
}

function exportToExcel(data, columns, fileName = "Report.xlsx") {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "YourApp";
  workbook.created = new Date();
  workbook.modified = new Date();
  
  // إنشاء ورقة عمل مع تعيين RTL
  const worksheet = workbook.addWorksheet("Report", { properties: { rightToLeft: true } });
  worksheet.views = [{ rightToLeft: true }];
  
  // عكس ترتيب الأعمدة لتتناسب مع RTL
  const reversedCols = columns.slice().reverse().map(col => ({
    header: col.header,
    key: col.key,
    width: col.width,
    style: { alignment: { horizontal: "right" } }
  }));
  worksheet.columns = reversedCols;
  
  // إضافة الصفوف مع ضبط محاذاة الخلايا
  data.forEach(row => {
    const rowArray = reversedCols.map(col => row[col.key]);
    const newRow = worksheet.addRow(rowArray);
    newRow.eachCell({ includeEmpty: true }, cell => {
      cell.alignment = { horizontal: "right" };
    });
  });
  
  workbook.xlsx.writeBuffer().then(buffer => {
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

function exportDailyExcel() {
  exportReportExcel("dailyReportContent", "#dailyTable table");
}

/*******************************************
 * جلب التقارير (الحالات المحولة، عدد الزوار، تقرير الحاج، تقرير الوفيات)
 ******************************************/
function fetchTransferredReport() {
  fetch(`${API_URL}?action=getTransferredCases`)
    .then(r => r.json())
    .then(data => {
      data.sort((a, b) => new Date(a["تاريخ التحويل"]) - new Date(b["تاريخ التحويل"]));
      const reportDiv = document.getElementById("transferredReportContent");
      if (data.length > 0) {
        let html = `
          <div class='table-responsive' id='transferredTable'>
            <table class='table table-bordered text-center rtl-table'>
              <thead>
                <tr>
                  <th>المنشأة</th>
                  <th>الفندق</th>
                  <th>اسم الحاج</th>
                  <th>رقم الجواز</th>
                  <th>الجنس</th>
                  <th>العمر</th>
                  <th>المحافظة</th>
                  <th>الحالة المرضية</th>
                  <th>التشخيص</th>
                  <th>اسم المستشفى</th>
                  <th>تاريخ التحويل</th>
                  <th>وقت التحويل</th>
                  <th>حالة المريض</th>
                </tr>
              </thead>
              <tbody>
        `;
        data.forEach(item => {
          html += `
            <tr>
              <td>${item["المنشأة"] || ""}</td>
              <td>${item["الفندق"] || ""}</td>
              <td>${item["اسم الحاج"] || ""}</td>
              <td>${item["رقم الجواز"] || ""}</td>
              <td>${item["الجنس"] || ""}</td>
              <td>${item["العمر"] || ""}</td>
              <td>${item["المحافظة"] || ""}</td>
              <td>${item["الحالة المرضية"] || ""}</td>
              <td>${item["التشخيص"] || ""}</td>
              <td>${item["اسم المستشفى"] || ""}</td>
              <td>${item["تاريخ التحويل"] ? formatDate(item["تاريخ التحويل"]) : ""}</td>
              <td>${item["وقت التحويل"] ? formatTime(item["وقت التحويل"]) : ""}</td>
              <td>${item["حالة المريض"] || ""}</td>
            </tr>
          `;
        });
        html += "</tbody></table></div>";
        reportDiv.innerHTML = html;
        setTimeout(() => {
          $("#transferredTable table").DataTable({
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
    .catch(e => {
      console.error("خطأ أثناء جلب الحالات المحولة:", e);
      document.getElementById("transferredReportContent").innerHTML = "حدث خطأ أثناء جلب البيانات.";
    });
}

function fetchDailyVisitors() {
  fetch(`${API_URL}?action=getDailyVisitors`)
    .then(r => r.json())
    .then(data => {
      data.sort((a, b) => new Date(a["التاريخ"]) - new Date(b["التاريخ"]));
      const div = document.getElementById("dailyReportContent");
      if (data.length > 0) {
        let html = `
          <div class='table-responsive' id='dailyTable'>
            <table class='table table-bordered text-center rtl-table'>
              <thead>
                <tr>
                  <th>المنشأة</th>
                  <th>اسم الطبيب</th>
                  <th>الفندق العلاجي</th>
                  <th>اسم الحاج</th>
                  <th>رقم الجواز</th>
                  <th>الجنس</th>
                  <th>العمر</th>
                  <th>المرض المزمن</th>
                  <th>اسم العلاج المستخدم</th>
                  <th>التاريخ</th>
                  <th>الوقت</th>
                  <th>المحافظة</th>
                  <th>الحالة الاجتماعية</th>
                  <th>الحالة المرضية</th>
                  <th>التشخيص</th>
                  <th>الوصفة الطبية</th>
                  <th>صرف العلاج</th>
                </tr>
              </thead>
              <tbody>
        `;
        data.forEach(item => {
          html += `
            <tr>
              <td>${item["المنشأة"] || ""}</td>
              <td>${item["اسم الطبيب"] || ""}</td>
              <td>${item["الفندق العلاجي"] || ""}</td>
              <td>${item["اسم الحاج"] || ""}</td>
              <td>${item["رقم الجواز"] || ""}</td>
              <td>${item["الجنس"] || ""}</td>
              <td>${item["العمر"] || ""}</td>
              <td>${item["المرض المزمن"] || ""}</td>
              <td>${item["اسم العلاج المستخدم"] || ""}</td>
              <td>${item["التاريخ"] ? formatDate(item["التاريخ"]) : ""}</td>
              <td>${item["الوقت"] ? formatTime(item["الوقت"]) : ""}</td>
              <td>${item["المحافظة"] || ""}</td>
              <td>${item["الحالة الاجتماعية"] || ""}</td>
              <td>${item["الحالة المرضية"] || ""}</td>
              <td>${item["التشخيص"] || ""}</td>
              <td>${item["الوصفة الطبية"] || ""}</td>
              <td>${item["صرف العلاج"] || ""}</td>
            </tr>
          `;
        });
        html += "</tbody></table></div>";
        div.innerHTML = html;
        setTimeout(() => {
          $("#dailyTable table").DataTable({
            paging: true,
            searching: true,
            ordering: true,
            language: { url: "https://cdn.datatables.net/plug-ins/1.13.4/i18n/ar.json" }
          });
        }, 0);
      } else {
        div.innerHTML = "لا توجد بيانات متوفرة.";
      }
    })
    .catch(e => {
      console.error("خطأ أثناء جلب عدد الزوار اليومي:", e);
      document.getElementById("dailyReportContent").innerHTML = "حدث خطأ أثناء جلب البيانات.";
    });
}

function fetchPatientReport() {
  const ppInput = document.getElementById("patientPassport");
  if (!ppInput || !ppInput.value.trim()) {
    showErrorToast("يرجى إدخال رقم الجواز.");
    return;
  }
  const passport = ppInput.value.trim();
  fetch(`${API_URL}?action=getPatientReport&passport=${encodeURIComponent(passport)}`)
    .then(r => r.json())
    .then(data => {
      const div = document.getElementById("patientReportContent");
      if (data.length > 0) {
        let html = `
          <div class='table-responsive' id='patientTable'>
            <table class='table table-bordered text-center rtl-table'>
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
                </tr>
              </thead>
              <tbody>
        `;
        data.forEach(item => {
          html += `
            <tr>
              <td>${item["المنشأة"] || ""}</td>
              <td>${item["الفندق"] || ""}</td>
              <td>${item["اسم الحاج"] || ""}</td>
              <td>${item["رقم الجواز"] || ""}</td>
              <td>${item["الجنس"] || ""}</td>
              <td>${item["العمر"] || ""}</td>
              <td>${item["المرض المزمن"] || ""}</td>
              <td>${item["اسم العلاج المستخدم"] || ""}</td>
            </tr>
          `;
        });
        html += "</tbody></table></div>";
        div.innerHTML = html;
        setTimeout(() => {
          $("#patientTable table").DataTable({
            paging: true,
            searching: true,
            ordering: true,
            language: { url: "https://cdn.datatables.net/plug-ins/1.13.4/i18n/ar.json" }
          });
        }, 0);
      } else {
        div.innerHTML = "لا توجد بيانات متوفرة لهذا الحاج.";
      }
    })
    .catch(e => {
      console.error("خطأ أثناء جلب تقرير الحاج:", e);
      showErrorToast("حدث خطأ أثناء جلب التقرير.");
    });
}

function fetchDeathReport() {
  fetch(`${API_URL}?action=getDeathReport`)
    .then(r => r.json())
    .then(data => {
      data.sort((a, b) => new Date(a["تاريخ الوفاة"]) - new Date(b["تاريخ الوفاة"]));
      const div = document.getElementById("deathReportContent");
      if (data.length > 0) {
        let html = `
          <div class='table-responsive' id='deathTable'>
            <table class='table table-bordered text-center rtl-table'>
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
                  <th>سبب الوفاة</th>
                  <th>المستشفى</th>
                  <th>مكان الدفن</th>
                  <th>تاريخ الوفاة</th>
                  <th>وقت الوفاة</th>
                  <th>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
        `;
        data.forEach(item => {
          html += `
            <tr>
              <td>${item["المنشأة"] || ""}</td>
              <td>${item["الفندق"] || ""}</td>
              <td>${item["اسم الحاج"] || ""}</td>
              <td>${item["رقم الجواز"] || ""}</td>
              <td>${item["الجنس"] || ""}</td>
              <td>${item["العمر"] || ""}</td>
              <td>${item["المرض المزمن"] || ""}</td>
              <td>${item["اسم العلاج المستخدم"] || ""}</td>
              <td>${item["سبب الوفاة"] || ""}</td>
              <td>${item["المستشفى"] || ""}</td>
              <td>${item["مكان الدفن"] || ""}</td>
              <td>${item["تاريخ الوفاة"] ? formatDate(item["تاريخ الوفاة"]) : ""}</td>
              <td>${item["وقت الوفاة"] ? formatTime(item["وقت الوفاة"]) : ""}</td>
              <td>${item["ملاحظات"] || ""}</td>
            </tr>
          `;
        });
        html += "</tbody></table></div>";
        div.innerHTML = html;
        setTimeout(() => {
          $("#deathTable table").DataTable({
            paging: true,
            searching: true,
            ordering: true,
            language: { url: "https://cdn.datatables.net/plug-ins/1.13.4/i18n/ar.json" }
          });
        }, 0);
      } else {
        div.innerHTML = "لا توجد بيانات وفيات متوفرة.";
      }
    })
    .catch(e => {
      console.error("خطأ أثناء جلب تقرير الوفيات:", e);
      document.getElementById("deathReportContent").innerHTML = "حدث خطأ أثناء جلب البيانات.";
    });
}

/*******************************************
 * عند تحميل الصفحة
 ******************************************/
document.addEventListener("DOMContentLoaded", () => {
  // زر البحث
  const searchButton = document.getElementById("searchButton");
  if (searchButton) {
    searchButton.addEventListener("click", () => searchPilgrim());
  }

// زر "إضافة بيانات علاجية"
const addDataBtn = document.getElementById("addDataBtn");
if (addDataBtn) {
  // ضبط تنسيق الحاوية (الوالد) للزر
  const container = addDataBtn.parentElement;
  if (container) {
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.maxWidth = "600px";
    container.style.margin = "0 auto";          // توسيط الحاوية أفقياً
    container.style.padding = "1.5rem";
    container.style.background = "linear-gradient(to bottom, #fff, #f9f9f9)";
    container.style.borderRadius = "px";
  }

  // تعيين التنسيقات المطلوبة للزر نفسه
  addDataBtn.style.minWidth = "350px";
  addDataBtn.style.backgroundColor = "#fff";
  addDataBtn.style.border = "2px solid var(--gold-color)";
  addDataBtn.style.color = "#055160";
  addDataBtn.style.fontSize = "1.5rem";
  addDataBtn.style.padding = "0.5rem 1.5rem";
  addDataBtn.style.whiteSpace = "nowrap";
  addDataBtn.style.borderRadius = "6px";
  addDataBtn.style.display = "inline-flex";
  addDataBtn.style.alignItems = "center";
  addDataBtn.style.justifyContent = "center";

  // إضافة مستمع الحدث لفتح المودال
  addDataBtn.addEventListener("click", () => openModal());
}


  // زر حفظ بيانات العلاج
  const saveTreatmentDataBtn = document.getElementById("saveTreatmentDataBtn");
  if (saveTreatmentDataBtn) {
    saveTreatmentDataBtn.addEventListener("click", () => saveTreatmentData());
  }

// زر "بيانات الوفاة"
const deathDataBtn = document.getElementById("deathDataBtn");
if (deathDataBtn) {
  // ضبط تنسيق الحاوية (الوالد) للزر
  const container = deathDataBtn.parentElement;
  if (container) {
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.maxWidth = "600px";
    container.style.margin = "1rem auto 0";  // ظهور الحاوية أسفل الحاوية السابقة
    container.style.padding = "1.5rem";
    container.style.background = "linear-gradient(to bottom, #fff, #f9f9f9)";
    container.style.borderRadius = "8px";
  }

  // تعيين التنسيقات المطلوبة للزر نفسه
  deathDataBtn.style.minWidth = "350px";
  deathDataBtn.style.backgroundColor = "#fff";
  deathDataBtn.style.border = "2px solid var(--gold-color)";
  deathDataBtn.style.color = "red";
  deathDataBtn.style.fontSize = "1.5rem";
  deathDataBtn.style.padding = "0.5rem 1.5rem";
  deathDataBtn.style.whiteSpace = "nowrap";
  deathDataBtn.style.borderRadius = "6px";
  deathDataBtn.style.display = "inline-flex";
  deathDataBtn.style.alignItems = "center";
  deathDataBtn.style.justifyContent = "center";

  // إضافة مستمع الحدث لفتح مودال بيانات الوفاة
  deathDataBtn.addEventListener("click", () => openDeathModal());
}

  // زر حفظ بيانات الوفاة
  const saveDeathDataBtn = document.getElementById("saveDeathDataBtn");
  if (saveDeathDataBtn) {
    saveDeathDataBtn.addEventListener("click", () => saveDeathData());
  }

  // زر بحث تقرير الحاج
  const fetchPatientReportBtn = document.getElementById("fetchPatientReportBtn");
  if (fetchPatientReportBtn) {
    fetchPatientReportBtn.addEventListener("click", () => fetchPatientReport());
  }

  // تبويب "الحالات المحولة"
  const transferredTab = document.getElementById("transferred-tab");
  if (transferredTab) {
    transferredTab.addEventListener("shown.bs.tab", () => fetchTransferredReport());
  }

  // تبويب "عدد الزوار اليومي"
  const dailyTab = document.getElementById("daily-tab");
  if (dailyTab) {
    dailyTab.addEventListener("shown.bs.tab", () => fetchDailyVisitors());
  }

  // تبويب "الوفيات"
  const deathTab = document.getElementById("death-tab");
  if (deathTab) {
    deathTab.addEventListener("shown.bs.tab", () => fetchDeathReport());
  }

  // تفعيل التولتيب
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // إعادة تهيئة التقارير عند إغلاق نافذة التقارير لمنع ظهورها أسفل الصفحة
  const reportsModalEl = document.getElementById("reportsModal");
  if (reportsModalEl) {
    reportsModalEl.addEventListener("hidden.bs.modal", () => {
      const contentIds = [
        "transferredReportContent",
        "dailyReportContent",
        "patientReportContent",
        "deathReportContent"
      ];
      contentIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.classList.add("table-responsive");
          el.style.overflow = "";
          el.style.width = "";
        }
      });
    });
  }
});
