/* introduction.js
 * Powers the introduction form by handling validation, dynamic course rows,
 * and rendering an introduction page that mirrors the static version.
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("introduction-form");
  const standaloneResetButton = document.getElementById("startOverButton");

  if (!form) {
    if (standaloneResetButton) {
      const redirectTarget =
        standaloneResetButton.dataset.redirect || "intro_form.html";
      standaloneResetButton.addEventListener("click", () => {
        window.location.href = redirectTarget;
      });
    }
    return;
  }

  const courseTemplate = document.getElementById("courseTemplate");
  const courseList = document.getElementById("courseList");
  const addCourseButton = document.getElementById("addCourseButton");
  const clearButton = document.getElementById("clearButton");
  const generatedContainer = document.getElementById("generated-introduction");
  const helperHeading = document.querySelector("#intro-form h3");
  const pictureUploadInput = document.getElementById("pictureUpload");

  if (!courseTemplate || !courseList || !generatedContainer) {
    return;
  }

  const defaultCourses = [];
  defaultCourses.push({
    department: "ITIS",
    number: "3135",
    name: "Web Design & Development",
    reason: "Course is required for my major, but seems fun."
  });
  defaultCourses.push({
    department: "ITSC",
    number: "3155",
    name: "Software Engineering",
    reason: "Also required for major."
  });
  defaultCourses.push({
    department: "STAT",
    number: "2122",
    name: "Intro To Prob and Stat",
    reason: "Required for my major."
  });
  defaultCourses.push({
    department: "GEOG",
    number: "1511",
    name: "Local Social Science",
    reason: "I'm passionate about urban planning and urban development, so I really wanted to take this class."
  });

  function toggleRemoveButtons() {
    const rows = courseList.querySelectorAll(".course-row");
    rows.forEach((row) => {
      const button = row.querySelector(".remove-course");
      if (button) {
        button.disabled = rows.length <= 1;
      }
    });
  }

  function createCourseRow(courseData = {}) {
    const fragment = courseTemplate.content.cloneNode(true);
    const row = fragment.querySelector(".course-row");
    const [deptInput, numberInput, nameInput, reasonInput] = row.querySelectorAll(
      "input"
    );

    deptInput.value = courseData.department || "";
    numberInput.value = courseData.number || "";
    nameInput.value = courseData.name || "";
    reasonInput.value = courseData.reason || "";

    const removeButton = row.querySelector(".remove-course");
    if (removeButton) {
      removeButton.addEventListener("click", () => {
        row.remove();
        toggleRemoveButtons();
      });
    }

    return row;
  }

  function renderDefaultCourses() {
    courseList.innerHTML = "";
    defaultCourses.forEach((course) => {
      const row = createCourseRow(course);
      courseList.appendChild(row);
    });
    toggleRemoveButtons();
  }

  function buildNameDisplay(
    first,
    middle,
    nickname,
    last,
    divider,
    mascotAdjective,
    mascotAnimal
  ) {
    const nameParts = [first];
    if (middle) {
      nameParts.push(middle);
    }
    if (nickname) {
      nameParts.push(`"${nickname}"`);
    }
    nameParts.push(last);

    const mascot = [mascotAdjective, mascotAnimal].filter(Boolean).join(" ");
    return `${nameParts.filter(Boolean).join(" ")} ${divider} ${mascot}`;
  }

  function collectFormData() {
    const valueOf = (selector) => {
      const field = form.querySelector(selector);
      if (field && typeof field.value === "string") {
        return field.value.trim();
      }
      return "";
    };
    const courseRows = Array.from(courseList.querySelectorAll(".course-row"));
    const linkRows = Array.from(form.querySelectorAll("#linkList .link-row"));

    return {
      firstName: valueOf("#firstName"),
      middleName: valueOf("#middleName"),
      nickname: valueOf("#nickname"),
      lastName: valueOf("#lastName"),
      ackStatement: valueOf("#ackStatement"),
      ackInitials: valueOf("#ackInitials"),
      ackDate: valueOf("#ackDate"),
      mascotAdjective: valueOf("#mascotAdjective"),
      mascotAnimal: valueOf("#mascotAnimal"),
      divider: valueOf("#divider") || "~",
      personalStatement: valueOf("#personalStatement"),
      pictureUrl: valueOf("#pictureUrl") || "images/headshot.jpg",
      pictureAlt: valueOf("#pictureAlt") || `${valueOf("#firstName")} ${valueOf("#lastName")} portrait`,
      pictureCaption: valueOf("#pictureCaption"),
      personalBackground: valueOf("#personalBackground"),
      professionalBackground: valueOf("#professionalBackground"),
      academicBackground: valueOf("#academicBackground"),
      subjectBackground: valueOf("#subjectBackground"),
      computerPlatform: valueOf("#computerPlatform"),
      funnyThing: valueOf("#funnyThing"),
      extraShare: valueOf("#extraShare"),
      quote: valueOf("#quote"),
      quoteAuthor: valueOf("#quoteAuthor"),
      courses: courseRows.map((row) => {
        const inputs = row.querySelectorAll("input");
        const dept = inputs[0];
        const number = inputs[1];
        const name = inputs[2];
        const reason = inputs[3];
        return {
          department: dept && typeof dept.value === "string" ? dept.value.trim() : "",
          number: number && typeof number.value === "string" ? number.value.trim() : "",
          name: name && typeof name.value === "string" ? name.value.trim() : "",
          reason: reason && typeof reason.value === "string" ? reason.value.trim() : ""
        };
      }),
      links: linkRows.map((row) => {
        const inputs = row.querySelectorAll("input");
        const labelField = inputs[0];
        const urlField = inputs[1];
        return {
          label:
            labelField && typeof labelField.value === "string"
              ? labelField.value.trim()
              : "",
          url:
            urlField && typeof urlField.value === "string" ? urlField.value.trim() : ""
        };
      })
    };
  }

  function renderIntroduction(data) {
    const formattedAckDate = data.ackDate || "";
    const nameWithNickname = buildNameDisplay(
      data.firstName,
      data.middleName,
      data.nickname,
      data.lastName,
      data.divider,
      data.mascotAdjective,
      data.mascotAnimal
    );

    const courseListMarkup = data.courses
      .map((course) => {
        if (!course.department && !course.number && !course.name && !course.reason) {
          return "";
        }
        const courseLabel = [course.department, course.number]
          .filter(Boolean)
          .join(" ");
        return `<li><strong>${courseLabel}${course.name ? ` - ${course.name}` : ""}:</strong> ${course.reason}</li>`;
      })
      .join("");

    const linksMarkup = data.links
      .filter((link) => link.label && link.url)
      .map(
        (link) =>
          `<li><a href="${link.url}" target="_blank" rel="noopener">${link.label}</a></li>`
      )
      .join("");

    const introductionHTML = `
      <section>
        <p><em>${data.ackStatement} - ${data.ackInitials}${formattedAckDate ? `, ${formattedAckDate}` : ""}</em></p>
        <p class="display-line">${nameWithNickname}</p>
        ${data.personalStatement ? `<p class="personal-statement">${data.personalStatement}</p>` : ""}
        <figure class="profile-figure">
          <img src="${data.pictureSrc}" alt="${data.pictureAlt}" class="headshot">
          <figcaption>${data.pictureCaption}</figcaption>
        </figure>
        <section class="content-block">
          <h3>Background and Course Information</h3>
          <ul class="info-list">
            <li><strong>Personal Background:</strong> ${data.personalBackground}</li>
            <li><strong>Professional Background:</strong> ${data.professionalBackground}</li>
            <li><strong>Academic Background:</strong> ${data.academicBackground}</li>
            <li><strong>Background in this Subject:</strong> ${data.subjectBackground}</li>
            <li><strong>Primary Computer Platform:</strong> ${data.computerPlatform}</li>
            <li>
              <strong>Courses I'm Taking &amp; Why:</strong>
              <ul>
                ${courseListMarkup}
              </ul>
            </li>
            ${
              data.funnyThing
                ? `<li><strong>Funny/Interesting Item to Remember me by:</strong> ${data.funnyThing}</li>`
                : ""
            }
            ${
              data.extraShare
                ? `<li><strong>Something I'd like to share:</strong> ${data.extraShare}</li>`
                : ""
            }
          </ul>
        </section>
        ${
          linksMarkup
            ? `<section class="content-block">
                <h3>Links</h3>
                <ul class="info-list">
                  ${linksMarkup}
                </ul>
              </section>`
            : ""
        }
        <section>
          <h3>Favorite Quote</h3>
          <p class="favorite-quote">"${data.quote}"<br>- <em>${data.quoteAuthor}</em></p>
        </section>
        <p class="reset-link"><button type="button" id="startOverButton" data-redirect="intro_form.html">Reset Form</button></p>
      </section>
    `;

    generatedContainer.innerHTML = introductionHTML;
    generatedContainer.hidden = false;
    form.hidden = true;
    if (helperHeading) {
      helperHeading.setAttribute("hidden", "hidden");
    }

    const resetButton = generatedContainer.querySelector("#startOverButton");
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        form.reset();
        generatedContainer.hidden = true;
        form.hidden = false;
        if (helperHeading) {
          helperHeading.removeAttribute("hidden");
        }
      });
    }
  }

  if (addCourseButton) {
    addCourseButton.addEventListener("click", () => {
      const newRow = createCourseRow();
      courseList.appendChild(newRow);
      toggleRemoveButtons();
      const firstInput = newRow.querySelector("input");
      if (firstInput) {
        firstInput.focus();
      }
    });
  }

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      const fields = form.querySelectorAll("input, textarea, select");
      fields.forEach((field) => {
        if (field.type === "button" || field.type === "submit" || field.type === "reset") {
          return;
        }

        if (field.type === "checkbox" || field.type === "radio") {
          field.checked = false;
        } else if (field.type === "file") {
          field.value = "";
        } else {
          field.value = "";
        }
      });

      courseList.innerHTML = "";
      const blankRow = createCourseRow();
      courseList.appendChild(blankRow);
      toggleRemoveButtons();
      generatedContainer.hidden = true;
      if (helperHeading) {
        helperHeading.removeAttribute("hidden");
      }
      form.hidden = false;
    });
  }

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      renderDefaultCourses();
      generatedContainer.hidden = true;
      form.hidden = false;
      if (helperHeading) {
        helperHeading.removeAttribute("hidden");
      }
    }, 0);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = collectFormData();
    let file = null;
    if (
      pictureUploadInput &&
      pictureUploadInput.files &&
      pictureUploadInput.files.length > 0
    ) {
      file = pictureUploadInput.files[0];
    }

    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const result = reader.result;
        formData.pictureSrc =
          typeof result === "string" && result.length > 0
            ? result
            : formData.pictureUrl;
        renderIntroduction(formData);
      });
      reader.readAsDataURL(file);
    } else {
      formData.pictureSrc = formData.pictureUrl;
      renderIntroduction(formData);
    }
  });

  // Kick off by rendering the default course set.
  renderDefaultCourses();
});
