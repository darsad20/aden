// رابط النشر
const API_URL = "https://script.google.com/macros/s/AKfycbyOVulRGonv0zi5viHkSid0Mwq-HlErHzV4rguIYicMNCimJO4B7ROEgcu3S8oX6EAD/exec";

/* دالة لتسجيل الدخول */
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

/* دالة لإظهار Toast نجاح */
function showSuccessToast(message) {
  console.log("Success:", message);
  const toastBody = document.getElementById("successToastBody");
  if (toastBody) {
    toastBody.textContent = message;
  }
  const toastEl = document.getElementById("successToast");
  if (toastEl) {
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

/* دالة لإظهار Toast خطأ */
function showErrorToast(message) {
  console.log("Error:", message);
  const toastBody = document.getElementById("errorToastBody");
  if (toastBody) {
    toastBody.textContent = message;
  }
  const toastEl = document.getElementById("errorToast");
  if (toastEl) {
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

/* دالة البحث عن حاج */
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
        const pilgrimData = data[0];
        // عرض بيانات الحاج في جدول رسمي
        pilgrimInfo.innerHTML = `
          <table class="table table-bordered mb-0 text-center" style="font-size: 1.1rem; color: #212529; white-space: nowrap;">
            <tbody>
              <tr>
                <th>المنشأة</th>
                <td>${pilgrimData["المنشأة"]}</td>
              </tr>
              <tr>
                <th>اسم الحاج</th>
                <td>${pilgrimData["اسم الحاج"]}</td>
              </tr>
              <tr>
                <th>الجنس</th>
                <td>${pilgrimData["الجنس"]}</td>
              </tr>
              <tr>
                <th>رقم الجواز</th>
                <td>${pilgrimData["رقم الجواز"]}</td>
              </tr>
              <tr>
                <th>العمر</th>
                <td>${pilgrimData["العمر"]}</td>
              </tr>
              <tr>
                <th>الحالة المرضية</th>
                <td>${pilgrimData["الحالة المرضية"]}</td>
              </tr>
            </tbody>
          </table>
        `;
        document.getElementById("hiddenPassport").value = pilgrimData["رقم الجواز"];
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

/* دالة فتح النافذة المنبثقة لإضافة بيانات علاجية */
function openModal() {
  const addDataModal = new bootstrap.Modal(document.getElementById('addDataModal'));
  addDataModal.show();
}

/* دالة حفظ البيانات العلاجية */
function saveTreatmentData() {
  const passport = document.getElementById("hiddenPassport").value;
  const prescription = document.getElementById("prescription").value;
  const notes = document.getElementById("notes").value;
  const tower = document.getElementById("tower").value;
  const diseaseType = document.getElementById("diseaseType").value;
  const treatmentName = document.getElementById("treatmentName").value;

  const searchUrl = `${API_URL}?action=searchPilgrim&passport=${encodeURIComponent(passport)}`;
  console.log("Search URL (for update):", searchUrl);
  
  fetch(searchUrl, { method: "GET" })
    .then(response => response.json())
    .then(result => {
      if (result.length > 0) {
        const pilgrim = result[0];
        const formData = new URLSearchParams();
        formData.append("action", "updatePilgrim");
        formData.append("institution", pilgrim["المنشأة"] || "");
        formData.append("name", pilgrim["اسم الحاج"] || "");
        formData.append("gender", pilgrim["الجنس"] || "");
        formData.append("passport", pilgrim["رقم الجواز"] || "");
        formData.append("age", pilgrim["العمر"] || "");
        formData.append("health", pilgrim["الحالة المرضية"] || "");
        formData.append("prescription", prescription);
        formData.append("notes", notes);
        formData.append("tower", tower);
        formData.append("diseaseType", diseaseType);
        formData.append("treatmentName", treatmentName);

        const updateUrl = `${API_URL}?${formData.toString()}`;
        console.log("Update URL:", updateUrl);

        fetch(updateUrl, { method: "GET" })
          .then(response => response.json())
          .then(data => {
            showSuccessToast(data.message);
            const addDataModal = bootstrap.Modal.getInstance(document.getElementById('addDataModal'));
            addDataModal.hide();
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

/* دالة عرض التقرير اليومي (اختيارية) */
function showDailyReport() {
  fetch(`${API_URL}?action=dailyReport`, { method: "GET" })
    .then(response => response.json())
    .then(data => {
      console.log("بيانات التقرير اليومي:", data);
      // يمكنك هنا معالجة البيانات وعرضها
    })
    .catch(error => console.error("خطأ:", error));
}
