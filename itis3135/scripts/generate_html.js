/* generate_html.js
 * Builds an HTML snippet from the introduction form and displays it with syntax highlighting.
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("introduction-form");
  const generateButton = document.getElementById("generateHtmlButton");
  const generatedContainer = document.getElementById("generated-introduction");
  const pageHeading = document.querySelector("#intro-form h2");
  const helperHeading = document.querySelector("#intro-form h3");
  const clearButton = document.getElementById("clearButton");
  const pictureUploadInput = document.getElementById("pictureUpload");

  if (!form || !generateButton || !generatedContainer || !pageHeading) {
    return;
  }

  const originalHeading = pageHeading.textContent || "Introduction Form";

  const resetView = () => {
    generatedContainer.hidden = true;
    generatedContainer.innerHTML = "";
    form.hidden = false;
    pageHeading.textContent = originalHeading;
    if (helperHeading) {
      helperHeading.removeAttribute("hidden");
    }
  };

  const escapeHtml = (value) => {
    if (!value) {
      return "";
    }
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  const buildDisplayName = (data) => {
    const parts = [];
    if (data.firstName) {
      parts.push(escapeHtml(data.firstName));
    }
    if (data.middleName) {
      parts.push(escapeHtml(data.middleName));
    }
    if (data.nickname) {
      parts.push(`"${escapeHtml(data.nickname)}"`);
    }
    if (data.lastName) {
      parts.push(escapeHtml(data.lastName));
    }
    const mascot = [data.mascotAdjective, data.mascotAnimal]
      .filter(Boolean)
      .map((item) => escapeHtml(item))
      .join(" ");
    const divider = escapeHtml(data.divider || "~");
    return `${parts.join(" ")} ${divider} ${mascot}`.trim();
  };

  const buildCourseMarkup = (courses) =>
    courses
      .filter((course) => course.department || course.number || course.name || course.reason)
      .map((course) => {
        const labels = [];
        if (course.department) {
          labels.push(escapeHtml(course.department));
        }
        if (course.number) {
          labels.push(escapeHtml(course.number));
        }
        const label = labels.join(" ").trim();
        const nameSegment = course.name ? ` - ${escapeHtml(course.name)}` : "";
        const reason = escapeHtml(course.reason || "");
        return `          <li><strong>${label}${nameSegment}:</strong> ${reason}</li>`;
      })
      .join("\n");

  const buildLinksMarkup = (links) =>
    links
      .filter((link) => link.label && link.url)
      .map(
        (link) =>
          `      <li><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.label)}</a></li>`
      )
      .join("\n");

  const valueOf = (selector, fallback = "") => {
    const field = form.querySelector(selector);
    if (field && typeof field.value === "string") {
      const trimmed = field.value.trim();
      return trimmed.length > 0 ? trimmed : fallback;
    }
    return fallback;
  };

  const collectFormData = () => {
    const courseRows = Array.from(form.querySelectorAll("#courseList .course-row"));
    const linkRows = Array.from(form.querySelectorAll("#linkList .link-row"));
    const firstName = valueOf("#firstName");
    const lastName = valueOf("#lastName");

    return {
      firstName,
      middleName: valueOf("#middleName"),
      nickname: valueOf("#nickname"),
      lastName,
      ackStatement: valueOf("#ackStatement"),
      ackInitials: valueOf("#ackInitials"),
      ackDate: valueOf("#ackDate"),
      mascotAdjective: valueOf("#mascotAdjective"),
      mascotAnimal: valueOf("#mascotAnimal"),
      divider: valueOf("#divider", "~"),
      personalStatement: valueOf("#personalStatement"),
      pictureUrl: valueOf("#pictureUrl", "images/headshot.jpg"),
      pictureAlt: valueOf("#pictureAlt", `${firstName} ${lastName}`.trim()),
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
        return {
          department: inputs[0] && typeof inputs[0].value === "string" ? inputs[0].value.trim() : "",
          number: inputs[1] && typeof inputs[1].value === "string" ? inputs[1].value.trim() : "",
          name: inputs[2] && typeof inputs[2].value === "string" ? inputs[2].value.trim() : "",
          reason: inputs[3] && typeof inputs[3].value === "string" ? inputs[3].value.trim() : ""
        };
      }),
      links: linkRows.map((row) => {
        const inputs = row.querySelectorAll("input");
        return {
          label: inputs[0] && typeof inputs[0].value === "string" ? inputs[0].value.trim() : "",
          url: inputs[1] && typeof inputs[1].value === "string" ? inputs[1].value.trim() : ""
        };
      }),
      pictureFile:
        pictureUploadInput &&
        pictureUploadInput.files &&
        pictureUploadInput.files.length > 0
          ? pictureUploadInput.files[0]
          : null
    };
  };

  const buildMarkup = (data) => {
    const displayName = buildDisplayName(data);
    const ackBits = [escapeHtml(data.ackStatement), "-", escapeHtml(data.ackInitials)];
    if (data.ackDate) {
      ackBits.push(`, ${escapeHtml(data.ackDate)}`);
    }
    const ackLine = ackBits.join(" ").replace(/\s+/g, " ").trim();

    const coursesMarkup = buildCourseMarkup(data.courses);
    const linksMarkup = buildLinksMarkup(data.links);

    const personalStatement = data.personalStatement
      ? `  <p class="personal-statement">${escapeHtml(data.personalStatement)}</p>\n`
      : "";

    const funnyItem = data.funnyThing
      ? `      <li><strong>Funny/Interesting Item to Remember me by:</strong> ${escapeHtml(data.funnyThing)}</li>\n`
      : "";

    const extraShare = data.extraShare
      ? `      <li><strong>Something I'd like to share:</strong> ${escapeHtml(data.extraShare)}</li>\n`
      : "";

    const coursesSection = coursesMarkup
      ? `      <li>
        <strong>Courses I'm Taking &amp; Why:</strong>
        <ul>
${coursesMarkup}
        </ul>
      </li>\n`
      : "";

    const linksSection = linksMarkup
      ? `  <section class="content-block">
    <h3>Links</h3>
    <ul class="info-list">
${linksMarkup}
    </ul>
  </section>\n`
      : "";

    return `<section class="introduction-html">
  <h2>Introduction HTML</h2>
  <h3>${displayName}</h3>
  <p><em>${ackLine}</em></p>
${personalStatement}  <figure class="profile-figure">
    <img src="${escapeHtml(data.pictureSrc)}" alt="${escapeHtml(data.pictureAlt)}" class="headshot">
    <figcaption>${escapeHtml(data.pictureCaption)}</figcaption>
  </figure>
  <section class="content-block">
    <h3>Background and Course Information</h3>
    <ul class="info-list">
      <li><strong>Personal Background:</strong> ${escapeHtml(data.personalBackground)}</li>
      <li><strong>Professional Background:</strong> ${escapeHtml(data.professionalBackground)}</li>
      <li><strong>Academic Background:</strong> ${escapeHtml(data.academicBackground)}</li>
      <li><strong>Background in this Subject:</strong> ${escapeHtml(data.subjectBackground)}</li>
      <li><strong>Primary Computer Platform:</strong> ${escapeHtml(data.computerPlatform)}</li>
${coursesSection}${funnyItem}${extraShare}    </ul>
  </section>
${linksSection}  <section>
    <h3>Favorite Quote</h3>
    <p class="favorite-quote">${escapeHtml(data.quote)}<br>- <em>${escapeHtml(data.quoteAuthor)}</em></p>
  </section>
</section>`;
  };

  const showCode = (markup) => {
    generatedContainer.innerHTML = "";

    const outputSection = document.createElement("section");
    outputSection.className = "generated-html-output";

    const pre = document.createElement("pre");
    pre.className = "generated-html-code";

    const code = document.createElement("code");
    code.className = "language-html";
    code.textContent = markup;

    pre.appendChild(code);
    outputSection.appendChild(pre);

    const controls = document.createElement("p");
    controls.className = "reset-link";

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "return-to-form";
    backButton.textContent = "Return to Form";

    controls.appendChild(backButton);
    outputSection.appendChild(controls);

    generatedContainer.appendChild(outputSection);
    generatedContainer.hidden = false;
    form.hidden = true;
    pageHeading.textContent = "Introduction HTML";
    if (helperHeading) {
      helperHeading.setAttribute("hidden", "hidden");
    }

    if (window.hljs && typeof window.hljs.highlightElement === "function") {
      window.hljs.highlightElement(code);
    }

    backButton.addEventListener("click", () => {
      resetView();
    });
  };

  const handleGeneration = () => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = collectFormData();

    const finalize = (source) => {
      data.pictureSrc = source;
      const markup = buildMarkup(data);
      showCode(markup);
    };

    if (data.pictureFile) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const result = reader.result;
        if (typeof result === "string" && result.length > 0) {
          finalize(result);
        } else {
          finalize(data.pictureUrl);
        }
      });
      reader.readAsDataURL(data.pictureFile);
    } else {
      finalize(data.pictureUrl);
    }
  };

  generateButton.addEventListener("click", handleGeneration);

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      resetView();
    }, 0);
  });

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      window.setTimeout(() => {
        pageHeading.textContent = originalHeading;
      }, 0);
    });
  }
});
